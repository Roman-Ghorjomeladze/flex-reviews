import { AppDataSource } from '../data-source';
import { Business } from '../entities/business.entity';
import { User } from '../entities/user.entity';
import { Review } from '../entities/review.entity';
import { ReviewCategory } from '../entities/review-category.entity';
import * as fs from 'fs';
import * as path from 'path';

interface ReviewCategoryData {
  id: number;
  name: string;
  stars: number;
}

interface SeedData {
  businesses: Array<{
    sourceId: string;
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    latitude: number | null;
    longitude: number | null;
    stars: number | null;
    reviewCount: number;
    isOpen: boolean;
    categories: string | null;
  }>;
  users: Array<{
    sourceId: string;
    name: string;
    reviewCount: number;
    averageStars: number | null;
  }>;
  reviews: Array<{
    sourceId: string;
    sourceUserId: string;
    sourceBusinessId: string;
    stars: number;
    channel: string;
    text: string;
    date: string;
    type: string;
    categories?: ReviewCategoryData[];
  }>;
}

async function seedDatabase() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Read seed data
    const seedDataPath = path.join(__dirname, '../seed-data.json');
    if (!fs.existsSync(seedDataPath)) {
      throw new Error(
        `Seed data file not found at ${seedDataPath}. Please ensure seed-data.json exists in the database directory.`,
      );
    }

    const seedData: SeedData = JSON.parse(
      fs.readFileSync(seedDataPath, 'utf-8'),
    );

    // Clear existing data (in order to respect foreign key constraints)
    console.log('Clearing existing data...');
    // Delete in order: children first, then parents
    await AppDataSource.createQueryBuilder()
      .delete()
      .from(ReviewCategory)
      .execute();
    await AppDataSource.createQueryBuilder()
      .delete()
      .from(Review)
      .execute();
    await AppDataSource.createQueryBuilder()
      .delete()
      .from(Business)
      .execute();
    await AppDataSource.createQueryBuilder()
      .delete()
      .from(User)
      .execute();

    // Create maps for sourceId to database id lookup
    const businessIdMap = new Map<string, number>();
    const userIdMap = new Map<string, number>();

    // Seed businesses
    console.log(`Seeding ${seedData.businesses.length} businesses...`);
    const businessRepository = AppDataSource.getRepository(Business);
    for (const businessData of seedData.businesses) {
      const business = businessRepository.create({
        sourceId: businessData.sourceId,
        name: businessData.name,
        address: businessData.address,
        city: businessData.city,
        state: businessData.state,
        postalCode: businessData.postalCode,
        latitude: businessData.latitude,
        longitude: businessData.longitude,
        stars: businessData.stars,
        reviewCount: businessData.reviewCount,
        isOpen: businessData.isOpen,
        categories: businessData.categories,
      });
      const savedBusiness = await businessRepository.save(business);
      businessIdMap.set(businessData.sourceId, savedBusiness.id);
    }
    console.log(`✅ Seeded ${seedData.businesses.length} businesses`);

    // Seed users
    console.log(`Seeding ${seedData.users.length} users...`);
    const userRepository = AppDataSource.getRepository(User);
    for (const userData of seedData.users) {
      const user = userRepository.create({
        sourceId: userData.sourceId,
        name: userData.name,
        reviewCount: userData.reviewCount,
        averageStars: userData.averageStars,
      });
      const savedUser = await userRepository.save(user);
      userIdMap.set(userData.sourceId, savedUser.id);
    }
    console.log(`✅ Seeded ${seedData.users.length} users`);

    // Seed reviews with categories
    console.log(`Seeding ${seedData.reviews.length} reviews...`);
    const reviewRepository = AppDataSource.getRepository(Review);
    const categoryRepository = AppDataSource.getRepository(ReviewCategory);
    let seededCount = 0;
    let categoryCount = 0;

    // Process reviews in batches
    const batchSize = 100;
    for (let i = 0; i < seedData.reviews.length; i += batchSize) {
      const batch = seedData.reviews.slice(i, i + batchSize);
      const reviewsToSave = [];
      const categoriesToSave = [];

      for (const reviewData of batch) {
        const businessId = businessIdMap.get(reviewData.sourceBusinessId);
        const userId = userIdMap.get(reviewData.sourceUserId);

        if (!businessId || !userId) {
          console.warn(
            `Skipping review ${reviewData.sourceId}: business or user not found`,
          );
          continue;
        }

        const review = reviewRepository.create({
          sourceId: reviewData.sourceId,
          businessId: businessId,
          userId: userId,
          stars: reviewData.stars,
          text: reviewData.text,
          date: new Date(reviewData.date),
          channel: reviewData.channel,
          type: reviewData.type,
          approved: false,
        });

        reviewsToSave.push({ review, categories: reviewData.categories || [] });
      }

      // Save reviews first
      const savedReviews = await reviewRepository.save(
        reviewsToSave.map((r) => r.review),
      );

      // Then save categories for each review
      for (let j = 0; j < savedReviews.length; j++) {
        const savedReview = savedReviews[j];
        const categories = reviewsToSave[j].categories;

        if (categories && categories.length > 0) {
          const reviewCategories = categories.map((cat) =>
            categoryRepository.create({
              reviewId: savedReview.id,
              category: cat.name,
              rating: cat.stars,
            }),
          );
          await categoryRepository.save(reviewCategories);
          categoryCount += reviewCategories.length;
        }
      }

      seededCount += savedReviews.length;

      if ((i + batchSize) % 500 === 0 || i + batchSize >= seedData.reviews.length) {
        console.log(
          `  Progress: ${seededCount}/${seedData.reviews.length} reviews, ${categoryCount} categories`,
        );
      }
    }

    console.log(`✅ Seeded ${seededCount} reviews with ${categoryCount} categories`);

    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

// Run seed
seedDatabase()
  .then(() => {
    console.log('Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });
