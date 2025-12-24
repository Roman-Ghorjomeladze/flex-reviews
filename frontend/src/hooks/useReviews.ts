import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi, ReviewFilters, PropertyFilters } from "../services/api";

/**
 * Query key factory for reviews
 */
export const reviewKeys = {
	all: ["reviews"] as const,
	lists: () => [...reviewKeys.all, "list"] as const,
	list: (filters?: ReviewFilters) => [...reviewKeys.lists(), filters] as const,
	details: () => [...reviewKeys.all, "detail"] as const,
	detail: (id: number) => [...reviewKeys.details(), id] as const,
	approved: (propertyId?: string) => [...reviewKeys.all, "approved", propertyId] as const,
};

/**
 * Hook to fetch reviews with filters
 */
export function useReviews(filters?: ReviewFilters) {
	return useQuery({
		queryKey: reviewKeys.list(filters),
		queryFn: () => reviewsApi.getReviews(filters),
		placeholderData: (previousData) => previousData, // Keep previous data while fetching
	});
}

/**
 * Hook to fetch property statistics with optional filters and pagination
 */
export function usePropertyStats(filters?: PropertyFilters) {
	return useQuery({
		queryKey: ["propertyStats", filters],
		queryFn: () => reviewsApi.getPropertyStats(filters),
		placeholderData: (previousData) => previousData,
	});
}

/**
 * Hook to fetch approved reviews for public display with pagination
 */
export function useApprovedReviews(propertyId?: string, page?: number, limit?: number) {
	return useQuery({
		queryKey: [...reviewKeys.approved(propertyId), page, limit],
		queryFn: () => reviewsApi.getApprovedReviews(propertyId, page, limit),
		placeholderData: (previousData) => previousData,
	});
}

/**
 * Hook to toggle review approval status
 */
export function useToggleApproval() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (reviewId: number) => reviewsApi.toggleApproval(reviewId),
		onSuccess: () => {
			// Invalidate all review queries to refetch updated data
			queryClient.invalidateQueries({ queryKey: reviewKeys.all });
			// Also invalidate property stats to update approval counts
			queryClient.invalidateQueries({ queryKey: ["propertyStats"] });
		},
	});
}

/**
 * Hook to fetch available channels
 */
export function useChannels() {
	return useQuery({
		queryKey: ["channels"],
		queryFn: () => reviewsApi.getChannels(),
		staleTime: 5 * 60 * 1000, // Cache for 5 minutes
	});
}

/**
 * Hook to fetch property information by propertyId
 */
export function useProperty(propertyId?: string) {
	return useQuery({
		queryKey: ["property", propertyId],
		queryFn: () => reviewsApi.getProperty(propertyId!),
		enabled: !!propertyId,
		staleTime: 10 * 60 * 1000, // Cache for 10 minutes
	});
}
