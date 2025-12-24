import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Review } from "./review.entity";

@Entity("users")
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	sourceId: string;

	@Column()
	name: string;

	@Column({ default: 0 })
	reviewCount: number;

	@Column({ type: "decimal", precision: 3, scale: 2, nullable: true })
	averageStars: number;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@OneToMany(() => Review, (review) => review.user)
	reviews: Review[];
}
