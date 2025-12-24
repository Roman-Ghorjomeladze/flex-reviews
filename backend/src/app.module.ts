import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsModule } from './reviews/reviews.module';
import { AppController } from './app.controller';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggerService } from './common/logger/logger.service';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { Business } from './database/entities/business.entity';
import { User } from './database/entities/user.entity';
import { Review } from './database/entities/review.entity';
import { ReviewCategory } from './database/entities/review-category.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5434', 10),
      username: process.env.DB_USERNAME || 'reviews_user',
      password: process.env.DB_PASSWORD || 'reviews_password',
      database: process.env.DB_DATABASE || 'reviews_db',
      entities: [Business, User, Review, ReviewCategory],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Global interceptors
    // LoggingInterceptor logs request/response with timing
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Request-scoped logger service
    LoggerService,
    // Middleware
    LoggingMiddleware,
  ],
  exports: [LoggerService], // Export so other modules can inject it
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply logging middleware to all routes
    // This runs FIRST, before interceptors, guards, and route handlers
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
