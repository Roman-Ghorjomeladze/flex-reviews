import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { LoggerService } from "../common/logger/logger.service";
import { Business } from "../database/entities/business.entity";
import { User } from "../database/entities/user.entity";
import { Review } from "../database/entities/review.entity";
import { ReviewCategory } from "../database/entities/review-category.entity";

@Module({
	imports: [TypeOrmModule.forFeature([Business, User, Review, ReviewCategory])],
	controllers: [ReviewsController],
	providers: [ReviewsService, LoggerService],
	exports: [ReviewsService],
})
export class ReviewsModule {}
