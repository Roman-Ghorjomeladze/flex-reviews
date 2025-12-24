import { ApiProperty } from '@nestjs/swagger';

export class PropertyStatsDto {
  @ApiProperty({ example: '29-shoreditch-heights' })
  propertyId: string;

  @ApiProperty({ example: '2B N1 A - 29 Shoreditch Heights' })
  propertyName: string;

  @ApiProperty({ required: false, nullable: true, example: 4.2 })
  averageRating: number | null;

  @ApiProperty({ example: 5 })
  totalReviews: number;

  @ApiProperty({ example: 3 })
  approvedReviews: number;

  @ApiProperty({
    example: { cleanliness: 4.5, communication: 4.0 },
    additionalProperties: { type: 'number' },
  })
  categoryAverages: Record<string, number>;
}

export class PropertyStatsResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ type: [PropertyStatsDto] })
  properties: PropertyStatsDto[];
}

