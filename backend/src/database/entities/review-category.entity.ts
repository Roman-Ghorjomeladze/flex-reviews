import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
	Index,
} from 'typeorm';
import { Review } from './review.entity';

@Entity('review_categories')
@Index(["reviewId"])
@Index(["category"])
@Index(["reviewId", "category"]) // Composite index for filtering reviews by category
export class ReviewCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Review, (review) => review.categories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @Column()
  reviewId: number;

  @Column({ type: 'varchar', length: 100 })
  category: string; // e.g., 'cleanliness', 'communication', etc.

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

