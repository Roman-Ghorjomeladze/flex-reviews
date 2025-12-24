export interface CategoryRatings {
	cleanliness?: number;
	communication?: number;
	respect_house_rules?: number;
	check_in?: number;
	accuracy?: number;
	location?: number;
	value?: number;
}

export interface Review {
	id: number;
	propertyId: string;
	propertyName: string;
	channel: string;
	type: "guest-to-host" | "host-to-guest";
	overallRating: number | null;
	categories: CategoryRatings;
	comment: string;
	guestName: string;
	userId: string;
	submittedAt: string;
	approved: boolean;
}

export interface PropertyStats {
	propertyId: string;
	propertyName: string;
	averageRating: number | null;
	totalReviews: number;
	approvedReviews: number;
	categoryAverages: Record<string, number>;
}
