import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from "typeorm";
import { Review } from "./review.entity";

@Entity("businesses")
@Index(["sourceId"]) // Already unique, but explicit index for lookups
@Index(["name"]) // For propertyName filtering with ILIKE
@Index(["city"]) // For propertyCity filtering
@Index(["state"]) // For propertyState filtering
@Index(["postalCode"]) // For propertyPostalCode filtering
export class Business {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	sourceId: string;

	@Column()
	name: string;

	@Column({ nullable: true })
	address: string;

	@Column({ nullable: true })
	city: string;

	@Column({ nullable: true })
	state: string;

	@Column({ nullable: true })
	postalCode: string;

	@Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
	latitude: number;

	@Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
	longitude: number;

	@Column({ type: "decimal", precision: 3, scale: 2, nullable: true })
	stars: number;

	@Column({ default: 0 })
	reviewCount: number;

	@Column({ default: true })
	isOpen: boolean;

	@Column({ type: "text", nullable: true })
	categories: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@OneToMany(() => Review, (review) => review.business)
	reviews: Review[];
}
