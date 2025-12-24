import { ApiProperty } from '@nestjs/swagger';

export class CategoryRatingsDto {
  @ApiProperty({ required: false, example: 5 })
  cleanliness?: number;

  @ApiProperty({ required: false, example: 4 })
  communication?: number;

  @ApiProperty({ required: false, example: 5 })
  respect_house_rules?: number;

  @ApiProperty({ required: false, example: 4 })
  check_in?: number;

  @ApiProperty({ required: false, example: 5 })
  accuracy?: number;

  @ApiProperty({ required: false, example: 4 })
  location?: number;

  @ApiProperty({ required: false, example: 5 })
  value?: number;
}

export class ReviewDto {
  @ApiProperty({ example: 7453 })
  id: number;

  @ApiProperty({ example: '29-shoreditch-heights' })
  propertyId: string;

  @ApiProperty({ example: '2B N1 A - 29 Shoreditch Heights' })
  propertyName: string;

  @ApiProperty({ example: 'hostaway' })
  channel: string;

  @ApiProperty({ enum: ['guest-to-host', 'host-to-guest'], example: 'guest-to-host' })
  type: 'guest-to-host' | 'host-to-guest';

  @ApiProperty({ required: false, nullable: true, example: 4.5 })
  overallRating: number | null;

  @ApiProperty({ type: CategoryRatingsDto })
  categories: CategoryRatingsDto;

  @ApiProperty({ example: 'Great location and clean apartment.' })
  comment: string;

  @ApiProperty({ example: 'John Doe' })
  guestName: string;

  @ApiProperty({ example: 'user-123' })
  userId: string;

  @ApiProperty({ example: '2020-09-15 10:30:00' })
  submittedAt: string;

  @ApiProperty({ example: true })
  approved: boolean;
}

export class PaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 50 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 2 })
  totalPages: number;
}

export class ReviewsResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 10 })
  count: number;

  @ApiProperty({ type: [ReviewDto] })
  reviews: ReviewDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

