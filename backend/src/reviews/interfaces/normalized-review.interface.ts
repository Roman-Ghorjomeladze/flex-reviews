export interface CategoryRatings {
  cleanliness?: number;
  communication?: number;
  respect_house_rules?: number;
  check_in?: number;
  accuracy?: number;
  location?: number;
  value?: number;
}

export interface NormalizedReview {
  id: number;
  propertyId: string;
  propertyName: string;
  channel: string;
  type: 'guest-to-host' | 'host-to-guest';
  overallRating: number | null;
  categories: CategoryRatings;
  comment: string;
  guestName: string;
  submittedAt: string;
  approved: boolean;
}

export interface ReviewFilters {
  listingId?: string;
  listingIds?: string[]; // Filter by multiple property IDs
  propertyName?: string;
  propertyCity?: string;
  propertyState?: string;
  propertyPostalCode?: string;
  minRating?: number;
  maxRating?: number;
  category?: string;
  channel?: string;
  type?: 'guest-to-host' | 'host-to-guest';
  from?: string;
  to?: string;
  approved?: boolean;
}

export interface ReviewSort {
  field: 'submittedAt' | 'overallRating' | 'propertyName';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

