import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1700000000000 implements MigrationInterface {
  name = 'AddPerformanceIndexes1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Review table indexes
    await queryRunner.query(`CREATE INDEX "IDX_reviews_businessId" ON "reviews" ("businessId")`);
    await queryRunner.query(`CREATE INDEX "IDX_reviews_userId" ON "reviews" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_reviews_date" ON "reviews" ("date")`);
    await queryRunner.query(`CREATE INDEX "IDX_reviews_stars" ON "reviews" ("stars")`);
    await queryRunner.query(`CREATE INDEX "IDX_reviews_approved" ON "reviews" ("approved")`);
    await queryRunner.query(`CREATE INDEX "IDX_reviews_channel" ON "reviews" ("channel")`);
    await queryRunner.query(`CREATE INDEX "IDX_reviews_type" ON "reviews" ("type")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_reviews_businessId_date" ON "reviews" ("businessId", "date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reviews_approved_date" ON "reviews" ("approved", "date")`,
    );

    // Business table indexes
    await queryRunner.query(`CREATE INDEX "IDX_businesses_sourceId" ON "businesses" ("sourceId")`);
    await queryRunner.query(`CREATE INDEX "IDX_businesses_name" ON "businesses" ("name")`);
    await queryRunner.query(`CREATE INDEX "IDX_businesses_city" ON "businesses" ("city")`);
    await queryRunner.query(`CREATE INDEX "IDX_businesses_state" ON "businesses" ("state")`);
    await queryRunner.query(`CREATE INDEX "IDX_businesses_postalCode" ON "businesses" ("postalCode")`);

    // ReviewCategory table indexes
    await queryRunner.query(`CREATE INDEX "IDX_review_categories_reviewId" ON "review_categories" ("reviewId")`);
    await queryRunner.query(`CREATE INDEX "IDX_review_categories_category" ON "review_categories" ("category")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_review_categories_reviewId_category" ON "review_categories" ("reviewId", "category")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes in reverse order
    await queryRunner.query(`DROP INDEX "IDX_review_categories_reviewId_category"`);
    await queryRunner.query(`DROP INDEX "IDX_review_categories_category"`);
    await queryRunner.query(`DROP INDEX "IDX_review_categories_reviewId"`);
    await queryRunner.query(`DROP INDEX "IDX_businesses_postalCode"`);
    await queryRunner.query(`DROP INDEX "IDX_businesses_state"`);
    await queryRunner.query(`DROP INDEX "IDX_businesses_city"`);
    await queryRunner.query(`DROP INDEX "IDX_businesses_name"`);
    await queryRunner.query(`DROP INDEX "IDX_businesses_sourceId"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_approved_date"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_businessId_date"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_type"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_channel"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_approved"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_stars"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_date"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_businessId"`);
  }
}

