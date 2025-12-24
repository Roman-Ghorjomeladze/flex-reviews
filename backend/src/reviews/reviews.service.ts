import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  NormalizedReview,
  ReviewFilters,
  ReviewSort,
  PaginationOptions,
  PaginatedResponse,
} from './interfaces/normalized-review.interface';
import { LoggerService } from '../common/logger/logger.service';
import { Review } from '../database/entities/review.entity';
import { Business } from '../database/entities/business.entity';
import { User } from '../database/entities/user.entity';
import { ReviewCategory } from '../database/entities/review-category.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ReviewCategory)
    private readonly categoryRepository: Repository<ReviewCategory>,
    @Inject(LoggerService) private readonly logger?: LoggerService,
  ) {}

  /**
   * Convert database Review entity to NormalizedReview format
   */
  private reviewToNormalized(
    review: Review & { business?: Business; user?: User; categories?: ReviewCategory[] },
  ): NormalizedReview {
    const business = review.business;
    const user = review.user;
    const categories = review.categories || [];

    // Build category ratings object
    const categoryRatings: NormalizedReview['categories'] = {};
    categories.forEach((cat) => {
      // Use category name as-is (should match interface keys)
      const key = cat.category as keyof NormalizedReview['categories'];
      categoryRatings[key] = cat.rating;
    });

    // Use business.sourceId as propertyId (or derive from name if needed)
    const propertyId = business?.sourceId || `business-${review.businessId}`;

    return {
      id: review.id,
      propertyId,
      propertyName: business?.name || 'Unknown Business',
      channel: review.channel,
      type: review.type as 'guest-to-host' | 'host-to-guest',
      overallRating: Number(review.stars),
      categories: categoryRatings,
      comment: review.text,
      guestName: user?.name || 'Anonymous',
      submittedAt: review.date.toISOString(),
      approved: review.approved,
    };
  }

  /**
   * Build query with filters applied
   */
  private buildFilteredQuery(
    filters?: ReviewFilters,
  ): SelectQueryBuilder<Review> {
    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.business', 'business')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.categories', 'categories');

    if (filters) {
      if (filters.listingId) {
        // Filter by single business sourceId
        query.andWhere('business.sourceId = :listingId', {
          listingId: filters.listingId,
        });
      }

      if (filters.listingIds && filters.listingIds.length > 0) {
        // Filter by multiple business sourceIds
        query.andWhere('business.sourceId IN (:...listingIds)', {
          listingIds: filters.listingIds,
        });
      }

      if (filters.propertyName) {
        query.andWhere('business.name ILIKE :propertyName', {
          propertyName: `%${filters.propertyName}%`,
        });
      }

      if (filters.propertyCity) {
        query.andWhere('business.city ILIKE :propertyCity', {
          propertyCity: `%${filters.propertyCity}%`,
        });
      }

      if (filters.propertyState) {
        query.andWhere('business.state ILIKE :propertyState', {
          propertyState: `%${filters.propertyState}%`,
        });
      }

      if (filters.propertyPostalCode) {
        query.andWhere('business.postalCode = :propertyPostalCode', {
          propertyPostalCode: filters.propertyPostalCode,
        });
      }

      if (filters.minRating !== undefined) {
        query.andWhere('review.stars >= :minRating', {
          minRating: filters.minRating,
        });
      }

      if (filters.maxRating !== undefined) {
        query.andWhere('review.stars <= :maxRating', {
          maxRating: filters.maxRating,
        });
      }

      if (filters.channel) {
        query.andWhere('review.channel = :channel', {
          channel: filters.channel,
        });
      }

      if (filters.type) {
        query.andWhere('review.type = :type', { type: filters.type });
      }

      if (filters.from) {
        query.andWhere('review.date >= :fromDate', {
          fromDate: new Date(filters.from),
        });
      }

      if (filters.to) {
        query.andWhere('review.date <= :toDate', {
          toDate: new Date(filters.to),
        });
      }

      if (filters.approved !== undefined) {
        query.andWhere('review.approved = :approved', {
          approved: filters.approved,
        });
      }

      if (filters.category) {
        // Filter by category rating - use the already joined categories
        query.andWhere('categories.category = :category', {
          category: filters.category,
        });
      }
    }

    return query;
  }

  /**
   * Get normalized reviews with filtering, sorting, and pagination
   */
  async getReviews(
    filters?: ReviewFilters,
    sort?: ReviewSort,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResponse<NormalizedReview>> {
    this.logger?.debug('Fetching reviews from database');

    // Default pagination values
    const page = pagination?.page || 1;
    const limit = Math.min(pagination?.limit || 50, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    let query = this.buildFilteredQuery(filters);

    // Get total count before pagination
    const total = await query.getCount();

    // Apply sorting
    if (sort) {
      let sortField: string;
      if (sort.field === 'propertyName') {
        sortField = 'business.name';
      } else if (sort.field === 'overallRating') {
        sortField = 'review.stars';
      } else if (sort.field === 'submittedAt') {
        sortField = 'review.date';
      } else {
        sortField = `review.${sort.field}`;
      }

      query = query.orderBy(sortField, sort.direction.toUpperCase() as 'ASC' | 'DESC');
    } else {
      // Default sort by date descending
      query = query.orderBy('review.date', 'DESC');
    }

    // Apply pagination
    query = query.skip(skip).take(limit);

    const reviews = await query.getMany();

    // Convert to normalized format (now synchronous since relations are loaded)
    const normalizedReviews = reviews.map((review) =>
      this.reviewToNormalized(review),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: normalizedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get reviews grouped by property
   */
  async getReviewsByProperty(): Promise<
    Record<string, NormalizedReview[]>
  > {
    // Get all reviews without pagination for grouping
    const result = await this.getReviews(undefined, undefined, { page: 1, limit: 10000 });
    const reviews = result.data;
    const grouped: Record<string, NormalizedReview[]> = {};

    reviews.forEach((review) => {
      if (!grouped[review.propertyId]) {
        grouped[review.propertyId] = [];
      }
      grouped[review.propertyId].push(review);
    });

    return grouped;
  }

  /**
   * Get available channels from the database
   */
  async getAvailableChannels(): Promise<string[]> {
    const channels = await this.reviewRepository
      .createQueryBuilder('review')
      .select('DISTINCT review.channel', 'channel')
      .where('review.channel IS NOT NULL')
      .orderBy('review.channel', 'ASC')
      .getRawMany();

    return channels.map((row) => row.channel).filter((ch) => ch);
  }

  /**
   * Get property information by sourceId
   */
  async getPropertyBySourceId(sourceId: string): Promise<{ propertyId: string; propertyName: string; categories: string | null } | null> {
    const business = await this.businessRepository.findOne({
      where: { sourceId },
      select: ['sourceId', 'name', 'categories'],
    });

    if (!business) {
      return null;
    }

    return {
      propertyId: business.sourceId,
      propertyName: business.name,
      categories: business.categories,
    };
  }

  /**
   * Get property statistics
   * Returns stats for ALL businesses, including those without reviews
   * Optimized with database-level aggregations
   * @param channel Optional channel filter
   */
  async getPropertyStats(channel?: string): Promise<
    Array<{
      propertyId: string;
      propertyName: string;
      averageRating: number | null;
      totalReviews: number;
      approvedReviews: number;
      categoryAverages: Record<string, number>;
    }>
  > {
    // Get all businesses (lightweight query)
    const businesses = await this.businessRepository.find({
      order: { name: 'ASC' },
      select: ['id', 'sourceId', 'name'],
    });

    // Get aggregated review stats per business using SQL aggregations
    // Start from businesses to include those without reviews
    const reviewStatsQuery = this.businessRepository
      .createQueryBuilder('business')
      .select('business.sourceId', 'propertyId')
      .addSelect('COUNT(review.id)', 'totalReviews')
      .addSelect('SUM(CASE WHEN review.approved = true THEN 1 ELSE 0 END)', 'approvedReviews')
      .addSelect('AVG(CAST(review.stars AS DECIMAL))', 'averageRating')
      .leftJoin('business.reviews', 'review');

    // Apply channel filter if provided
    if (channel) {
      reviewStatsQuery.andWhere('review.channel = :channel', { channel });
    }

    const reviewStats = await reviewStatsQuery
      .groupBy('business.sourceId')
      .getRawMany();

    // Create a map for quick lookup
    const statsMap = new Map<string, {
      totalReviews: number;
      approvedReviews: number;
      averageRating: number | null;
    }>();

    reviewStats.forEach((stat) => {
      statsMap.set(stat.propertyId, {
        totalReviews: parseInt(stat.totalReviews || '0', 10),
        approvedReviews: parseInt(stat.approvedReviews || '0', 10),
        averageRating: stat.averageRating ? parseFloat(stat.averageRating) : null,
      });
    });

    // Get category averages per business (separate optimized query)
    const categoryStatsQuery = this.businessRepository
      .createQueryBuilder('business')
      .select('business.sourceId', 'propertyId')
      .addSelect('category.category', 'category')
      .addSelect('AVG(CAST(category.rating AS DECIMAL))', 'averageRating')
      .leftJoin('business.reviews', 'review')
      .leftJoin('review.categories', 'category')
      .where('category.id IS NOT NULL');

    // Apply channel filter if provided
    if (channel) {
      categoryStatsQuery.andWhere('review.channel = :channel', { channel });
    }

    const categoryStats = await categoryStatsQuery
      .groupBy('business.sourceId')
      .addGroupBy('category.category')
      .getRawMany();

    // Group category averages by property
    const categoryMap = new Map<string, Record<string, number>>();
    categoryStats.forEach((stat) => {
      if (!categoryMap.has(stat.propertyId)) {
        categoryMap.set(stat.propertyId, {});
      }
      const categories = categoryMap.get(stat.propertyId)!;
      categories[stat.category] = Math.round(parseFloat(stat.averageRating) * 10) / 10;
    });

    // Build final stats array
    const stats = businesses.map((business) => {
      const propertyId = business.sourceId;
      const reviewStat = statsMap.get(propertyId) || {
        totalReviews: 0,
        approvedReviews: 0,
        averageRating: null,
      };
      const categoryAverages = categoryMap.get(propertyId) || {};

      return {
        propertyId,
        propertyName: business.name,
        averageRating: reviewStat.averageRating
          ? Math.round(reviewStat.averageRating * 10) / 10
          : null,
        totalReviews: reviewStat.totalReviews,
        approvedReviews: reviewStat.approvedReviews,
        categoryAverages,
      };
    });

    return stats;
  }

  /**
   * Toggle approval status of a review
   */
  async toggleApproval(reviewId: number): Promise<boolean> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error(`Review with id ${reviewId} not found`);
    }

    review.approved = !review.approved;
    await this.reviewRepository.save(review);

    this.logger?.log(
      `Review ${reviewId} ${review.approved ? 'approved' : 'unapproved'}`,
    );

    return review.approved;
  }

  /**
   * Get only approved reviews for public display
   */
  async getApprovedReviews(
    propertyId?: string,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResponse<NormalizedReview>> {
    const filters: ReviewFilters = { approved: true };
    if (propertyId) {
      filters.listingId = propertyId;
    }
    return this.getReviews(filters, {
      field: 'submittedAt',
      direction: 'desc',
    }, pagination);
  }
}
