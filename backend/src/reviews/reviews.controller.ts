import {
  Controller,
  Get,
  Query,
  Param,
  Patch,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import {
  ReviewFilters,
  ReviewSort,
  PaginationOptions,
} from './interfaces/normalized-review.interface';
import { ReviewsResponseDto } from './dto/review-response.dto';
import { PropertyStatsResponseDto } from './dto/property-stats.dto';

@ApiTags('reviews')
@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * GET /api/reviews/hostaway
   * Main endpoint for fetching normalized reviews
   * Supports filtering and sorting via query parameters
   */
  @Get('hostaway')
  @ApiOperation({
    summary: 'Get reviews from Hostaway',
    description: 'Fetches normalized reviews with optional filtering and sorting',
  })
  @ApiOkResponse({
    description: 'Reviews retrieved successfully',
    type: ReviewsResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiQuery({ name: 'listingId', required: false, description: 'Filter by single property ID' })
  @ApiQuery({ name: 'listingIds', required: false, description: 'Filter by multiple property IDs (comma-separated or multiple params)', type: [String] })
  @ApiQuery({ name: 'propertyName', required: false, description: 'Filter by property name (partial match)' })
  @ApiQuery({ name: 'propertyCity', required: false, description: 'Filter by property city (partial match)' })
  @ApiQuery({ name: 'propertyState', required: false, description: 'Filter by property state (partial match)' })
  @ApiQuery({ name: 'propertyPostalCode', required: false, description: 'Filter by property postal code (exact match)' })
  @ApiQuery({ name: 'minRating', required: false, type: Number, description: 'Minimum rating filter' })
  @ApiQuery({ name: 'maxRating', required: false, type: Number, description: 'Maximum rating filter' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'channel', required: false, description: 'Filter by review channel' })
  @ApiQuery({ name: 'type', required: false, enum: ['guest-to-host', 'host-to-guest'] })
  @ApiQuery({ name: 'from', required: false, description: 'Filter by date from (ISO format)' })
  @ApiQuery({ name: 'to', required: false, description: 'Filter by date to (ISO format)' })
  @ApiQuery({ name: 'approved', required: false, type: Boolean, description: 'Filter by approval status' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['submittedAt', 'overallRating', 'propertyName'] })
  @ApiQuery({ name: 'sortDir', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50, max: 100)' })
  async getHostawayReviews(
    @Query('listingId') listingId?: string,
    @Query('listingIds') listingIdsRaw?: string | string[],
    @Query('propertyName') propertyName?: string,
    @Query('propertyCity') propertyCity?: string,
    @Query('propertyState') propertyState?: string,
    @Query('propertyPostalCode') propertyPostalCode?: string,
    @Query('minRating') minRating?: string,
    @Query('maxRating') maxRating?: string,
    @Query('category') category?: string,
    @Query('channel') channel?: string,
    @Query('type') type?: 'guest-to-host' | 'host-to-guest',
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('approved') approved?: string,
    @Query('sortBy') sortBy?: 'submittedAt' | 'overallRating' | 'propertyName',
    @Query('sortDir') sortDir?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Build filters
    const filters: ReviewFilters = {};
    if (listingId) filters.listingId = listingId;
    
    // Handle listingIds - support both comma-separated string and array
    if (listingIdsRaw) {
      const listingIds = Array.isArray(listingIdsRaw)
        ? listingIdsRaw
        : listingIdsRaw.split(',').map((id) => id.trim()).filter((id) => id.length > 0);
      if (listingIds.length > 0) {
        filters.listingIds = listingIds;
      }
    }
    if (propertyName) filters.propertyName = propertyName;
    if (propertyCity) filters.propertyCity = propertyCity;
    if (propertyState) filters.propertyState = propertyState;
    if (propertyPostalCode) filters.propertyPostalCode = propertyPostalCode;
    if (minRating) filters.minRating = parseFloat(minRating);
    if (maxRating) filters.maxRating = parseFloat(maxRating);
    if (category) filters.category = category;
    if (channel) filters.channel = channel;
    if (type) filters.type = type;
    if (from) filters.from = from;
    if (to) filters.to = to;
    if (approved !== undefined) filters.approved = approved === 'true';

    // Build sort
    const sort: ReviewSort | undefined = sortBy
      ? {
          field: sortBy,
          direction: sortDir || 'desc',
        }
      : undefined;

    // Build pagination
    const pagination: PaginationOptions = {};
    if (page) pagination.page = parseInt(page, 10);
    if (limit) pagination.limit = parseInt(limit, 10);

    const result = await this.reviewsService.getReviews(filters, sort, pagination);

    return {
      status: 'success',
      count: result.data.length,
      reviews: result.data,
      pagination: result.pagination,
    };
  }

  /**
   * GET /api/reviews/properties
   * Get property statistics and aggregated data
   */
  @Get('properties')
  @ApiOperation({
    summary: 'Get property statistics',
    description: 'Returns aggregated statistics for all properties including average ratings and category breakdowns',
  })
  @ApiQuery({ name: 'channel', required: false, description: 'Filter statistics by review channel' })
  @ApiOkResponse({
    description: 'Property statistics retrieved successfully',
    type: PropertyStatsResponseDto,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getPropertyStats(@Query('channel') channel?: string) {
    const stats = await this.reviewsService.getPropertyStats(channel);
    return {
      status: 'success',
      properties: stats,
    };
  }

  /**
   * GET /api/reviews/channels
   * Get all available review channels
   */
  @Get('channels')
  @ApiOperation({
    summary: 'Get all available channels',
    description: 'Returns a list of all distinct channels that have reviews',
  })
  @ApiOkResponse({
    description: 'Channels retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        channels: {
          type: 'array',
          items: { type: 'string' },
          example: ['hostaway', 'google', 'yelp', 'booking', 'tripadvisor'],
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getChannels() {
    const channels = await this.reviewsService.getAvailableChannels();
    return {
      status: 'success',
      channels,
    };
  }

  /**
   * GET /api/reviews/property/:propertyId
   * Get property information by propertyId
   */
  @Get('property/:propertyId')
  @ApiOperation({
    summary: 'Get property information',
    description: 'Returns property information by propertyId (sourceId)',
  })
  @ApiParam({ name: 'propertyId', description: 'Property ID (sourceId)' })
  @ApiOkResponse({
    description: 'Property information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        property: {
          type: 'object',
          properties: {
            propertyId: { type: 'string' },
            propertyName: { type: 'string' },
            categories: { type: 'string', nullable: true, example: 'Doctors, Traditional Chinese Medicine, Health & Medical' },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getProperty(@Param('propertyId') propertyId: string) {
    const property = await this.reviewsService.getPropertyBySourceId(propertyId);
    if (!property) {
      return {
        status: 'error',
        message: 'Property not found',
      };
    }
    return {
      status: 'success',
      property,
    };
  }

  /**
   * GET /api/reviews/user/:userId
   * Get user information by userId
   */
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get user information',
    description: 'Returns user information by userId (sourceId)',
  })
  @ApiParam({ name: 'userId', description: 'User ID (sourceId)' })
  @ApiOkResponse({
    description: 'User information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        user: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            userName: { type: 'string' },
            reviewCount: { type: 'number' },
            averageStars: { type: 'number', nullable: true },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getUser(@Param('userId') userId: string) {
    const user = await this.reviewsService.getUserBySourceId(userId);
    if (!user) {
      return {
        status: 'error',
        message: 'User not found',
      };
    }
    return {
      status: 'success',
      user,
    };
  }

  /**
   * GET /api/reviews/user/:userId/reviews
   * Get reviews by user ID with pagination
   */
  @Get('user/:userId/reviews')
  @ApiOperation({
    summary: 'Get reviews by user',
    description: 'Returns all reviews written by a specific user',
  })
  @ApiParam({ name: 'userId', description: 'User ID (sourceId)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50, max: 100)' })
  @ApiOkResponse({
    description: 'Reviews retrieved successfully',
    type: ReviewsResponseDto,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getReviewsByUser(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pagination: PaginationOptions = {};
    if (page) pagination.page = parseInt(page, 10);
    if (limit) pagination.limit = parseInt(limit, 10);

    const result = await this.reviewsService.getReviewsByUser(userId, pagination);
    return {
      status: 'success',
      count: result.data.length,
      reviews: result.data,
      pagination: result.pagination,
    };
  }

  /**
   * GET /api/reviews/approved/:propertyId?
   * Get approved reviews for public display
   * If propertyId is provided, filter by property
   */
  @Get('approved/:propertyId?')
  @ApiOperation({
    summary: 'Get approved reviews',
    description: 'Returns only approved reviews for public display, optionally filtered by property ID',
  })
  @ApiParam({ name: 'propertyId', required: false, description: 'Optional property ID to filter reviews' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50, max: 100)' })
  @ApiOkResponse({
    description: 'Approved reviews retrieved successfully',
    type: ReviewsResponseDto,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getApprovedReviews(
    @Param('propertyId') propertyId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pagination: PaginationOptions = {};
    if (page) pagination.page = parseInt(page, 10);
    if (limit) pagination.limit = parseInt(limit, 10);

    const result = await this.reviewsService.getApprovedReviews(propertyId, pagination);
    return {
      status: 'success',
      count: result.data.length,
      reviews: result.data,
      pagination: result.pagination,
    };
  }

  /**
   * PATCH /api/reviews/:reviewId/approve
   * Toggle approval status of a review
   */
  @Patch(':reviewId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Toggle review approval',
    description: 'Toggles the approval status of a review for public display',
  })
  @ApiParam({ name: 'reviewId', type: Number, description: 'Review ID' })
  @ApiOkResponse({
    description: 'Approval status toggled successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        reviewId: { type: 'number', example: 7453 },
        approved: { type: 'boolean', example: true },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid review ID' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async toggleApproval(@Param('reviewId', ParseIntPipe) reviewId: number) {
    const approved = await this.reviewsService.toggleApproval(reviewId);
    return {
      status: 'success',
      reviewId,
      approved,
    };
  }
}

