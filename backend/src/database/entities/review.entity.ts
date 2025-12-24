import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
	Index,
} from "typeorm";
import { Business } from "./business.entity";
import { User } from "./user.entity";
import { ReviewCategory } from "./review-category.entity";

@Entity("reviews")
@Index(["businessId"])
@Index(["userId"])
@Index(["date"])
@Index(["stars"])
@Index(["approved"])
@Index(["channel"])
@Index(["type"])
@Index(["businessId", "date"]) // Composite index for common queries filtering by business and sorting by date
@Index(["approved", "date"]) // Composite index for approved reviews sorted by date
export class Review {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	sourceId: string;

	@ManyToOne(() => Business, (business) => business.reviews)
	@JoinColumn({ name: "businessId" })
	business: Business;

	@Column()
	businessId: number;

	@ManyToOne(() => User, (user) => user.reviews)
	@JoinColumn({ name: "userId" })
	user: User;

	@Column()
	userId: number;

	@Column({ type: "varchar", length: 50, default: "guest-to-host" })
	type: string;

	@Column({ type: "decimal", precision: 3, scale: 2 })
	stars: number;

	@Column({ type: "text" })
	text: string;

	@Column({ type: "timestamp" })
	date: Date;

	@Column({ default: false })
	approved: boolean;

	@Column({ type: "varchar", length: 50, default: "guest-to-host" })
	channel: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@OneToMany(() => ReviewCategory, (category) => category.review, {
		cascade: true,
	})
	categories: ReviewCategory[];
}
