import { useState, useMemo } from "react";
import { ReviewFilters, PropertyFilters } from "../services/api";
import PropertyStatsList from "../components/PropertyStatsList";
import ReviewTable from "../components/ReviewTable";
import FilterPanel from "../components/FilterPanel";
import Pagination from "../components/Pagination";
import { useReviews, usePropertyStats, useToggleApproval } from "../hooks/useReviews";
import "./ManagerDashboard.css";

function ManagerDashboard() {
	const [selectedProperty, setSelectedProperty] = useState<string>("");
	const [filters, setFilters] = useState<ReviewFilters>({});
	const [propertyFilters, setPropertyFilters] = useState<PropertyFilters>({});
	const [reviewsPage, setReviewsPage] = useState(1);
	const [propertiesPage, setPropertiesPage] = useState(1);
	const reviewsPerPage = 50;
	const propertiesPerPage = 10;

	// Use React Query hooks for data fetching with pagination
	const reviewsFiltersWithPagination = useMemo(
		() => ({
			...filters,
			page: reviewsPage,
			limit: reviewsPerPage,
		}),
		[filters, reviewsPage]
	);

	// Sync channel filter from review filters to property filters
	const propertiesFiltersWithPagination = useMemo(
		() => ({
			...propertyFilters,
			channel: filters.channel, // Sync channel from review filters
			page: propertiesPage,
			limit: propertiesPerPage,
		}),
		[propertyFilters, filters.channel, propertiesPage]
	);

	const {
		data: reviewsData,
		isLoading: reviewsLoading,
		error: reviewsError,
	} = useReviews(reviewsFiltersWithPagination);

	const {
		data: propertiesData,
		isLoading: statsLoading,
		error: statsError,
	} = usePropertyStats(propertiesFiltersWithPagination);

	const toggleApprovalMutation = useToggleApproval();

	const reviews = reviewsData?.data || [];
	const reviewsPagination = reviewsData?.pagination || {
		page: 1,
		limit: reviewsPerPage,
		total: 0,
		totalPages: 1,
	};

	const propertyStats = propertiesData?.data || [];

	const handleFilterChange = (newFilters: Partial<ReviewFilters>) => {
		setFilters((prev) => {
			const updated = { ...prev };
			// Apply new filters, removing undefined values
			Object.entries(newFilters).forEach(([key, value]) => {
				if (value === undefined || value === null || value === "") {
					delete updated[key as keyof ReviewFilters];
				} else {
					updated[key as keyof ReviewFilters] = value as any;
				}
			});
			return updated;
		});
		// Reset to first page when filters change
		setReviewsPage(1);
	};

	const handlePropertyFilterChange = (filterValue: string) => {
		// Store filter value for client-side filtering
		// We'll filter in the component
		if (filterValue.trim()) {
			setPropertyFilters({ name: filterValue.trim() });
		} else {
			setPropertyFilters({});
		}
		// Reset to first page when filters change
		setPropertiesPage(1);
	};

	// Client-side filtering of properties
	const filteredPropertyStats = useMemo(() => {
		if (!propertyFilters.name) {
			return propertyStats;
		}
		const filterLower = propertyFilters.name.toLowerCase();
		return propertyStats.filter((property) => property.propertyName.toLowerCase().includes(filterLower));
	}, [propertyStats, propertyFilters.name]);

	// Apply pagination to filtered properties
	const paginatedPropertyStats = useMemo(() => {
		const start = (propertiesPage - 1) * propertiesPerPage;
		const end = start + propertiesPerPage;
		return filteredPropertyStats.slice(start, end);
	}, [filteredPropertyStats, propertiesPage, propertiesPerPage]);

	const propertiesPaginationAdjusted = useMemo(
		() => ({
			page: propertiesPage,
			limit: propertiesPerPage,
			total: filteredPropertyStats.length,
			totalPages: Math.max(1, Math.ceil(filteredPropertyStats.length / propertiesPerPage)),
		}),
		[filteredPropertyStats.length, propertiesPage, propertiesPerPage]
	);

	const handlePropertySelect = (propertyId: string) => {
		if (selectedProperty === propertyId) {
			setSelectedProperty("");
			handleFilterChange({ listingId: undefined });
		} else {
			setSelectedProperty(propertyId);
			handleFilterChange({ listingId: propertyId });
		}
		// Reset to first page when property selection changes
		setReviewsPage(1);
	};

	const handleReviewsPageChange = (page: number) => {
		setReviewsPage(page);
		// Scroll to top of reviews section
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handlePropertiesPageChange = (page: number) => {
		setPropertiesPage(page);
	};

	const handleToggleApproval = async (reviewId: number) => {
		try {
			await toggleApprovalMutation.mutateAsync(reviewId);
		} catch (error) {
			console.error("Error toggling approval:", error);
		}
	};

	const handleClearFilters = () => {
		setFilters({});
		setSelectedProperty("");
	};

	return (
		<div className="manager-dashboard">
			<header className="dashboard-header">
				<h1>Flex Living Reviews Dashboard</h1>
				<p className="subtitle">Manage and monitor guest reviews across all properties</p>
			</header>

			<div className="dashboard-content">
				<aside className="sidebar">
					<PropertyStatsList
						stats={paginatedPropertyStats}
						pagination={propertiesPaginationAdjusted}
						selectedProperty={selectedProperty}
						onPropertySelect={handlePropertySelect}
						onPageChange={handlePropertiesPageChange}
						onFilterChange={handlePropertyFilterChange}
						loading={statsLoading}
					/>
				</aside>

				<main className="main-content">
					<FilterPanel
						filters={filters}
						onFilterChange={handleFilterChange}
						onClearFilters={handleClearFilters}
						propertyStats={propertyStats}
					/>

					<div className="reviews-section">
						<div className="section-header">
							<h2>Reviews</h2>
							<span className="review-count">
								{reviewsPagination.total} review{reviewsPagination.total !== 1 ? "s" : ""}
								{reviewsPagination.total > reviews.length &&
									` (showing ${reviews.length} on this page)`}
							</span>
						</div>

						{reviewsError && (
							<div className="error-message">Error loading reviews: {reviewsError.message}</div>
						)}

						{reviewsLoading ? (
							<div className="loading">Loading reviews...</div>
						) : (
							<>
								<ReviewTable reviews={reviews} onToggleApproval={handleToggleApproval} />
								<Pagination
									page={reviewsPagination.page}
									totalPages={reviewsPagination.totalPages}
									onPageChange={handleReviewsPageChange}
									total={reviewsPagination.total}
									limit={reviewsPagination.limit}
								/>
							</>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}

export default ManagerDashboard;
