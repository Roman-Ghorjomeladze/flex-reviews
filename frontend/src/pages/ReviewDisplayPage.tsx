import { useParams, Link } from "react-router-dom";
import { useApprovedReviews, useProperty } from "../hooks/useReviews";
import ReviewCard from "../components/ReviewCard";
import "./ReviewDisplayPage.css";

function ReviewDisplayPage() {
	const { propertyId } = useParams<{ propertyId: string }>();
	const { data: reviewsData, isLoading: reviewsLoading, error } = useApprovedReviews(propertyId);
	const { data: property, isLoading: propertyLoading } = useProperty(propertyId);

	// Handle paginated response
	const reviews = reviewsData?.data || [];

	// Get property name: first from property API, then from reviews, then fallback to propertyId
	const propertyName =
		property?.propertyName || (reviews.length > 0 ? reviews[0].propertyName : null) || propertyId || "Property";

	const loading = reviewsLoading || propertyLoading;

	const getAverageRating = () => {
		const ratings = reviews.map((r) => r.overallRating).filter((r) => r !== null) as number[];
		if (ratings.length === 0) return null;
		return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
	};

	const averageRating = getAverageRating();

	return (
		<div className="review-display-page">
			<header className="property-header">
				<Link to="/" className="back-link">
					← Back to Dashboard
				</Link>
				<div className="property-info">
					<h1>{propertyName || "Property Reviews"}</h1>
					{averageRating !== null && (
						<div className="property-rating">
							<span className="rating-value">{averageRating.toFixed(1)}</span>
							<span className="rating-label">out of 5.0</span>
							<span className="review-count">
								({reviews.length} review{reviews.length !== 1 ? "s" : ""})
							</span>
						</div>
					)}
				</div>
			</header>

			<main className="property-content">
				<section className="property-details">
					<h2>About this property</h2>
					{property?.categories ? (
						<p>{property.categories}</p>
					) : (
						<p>
							Experience the best of Flex Living with this carefully curated property. Our guests consistently
							rate this location highly for its comfort, location, and hospitality.
						</p>
					)}
				</section>

				<section className="reviews-section">
					<h2>Guest Reviews</h2>
					{error && <div className="error-message">Error loading reviews: {error.message}</div>}
					{loading ? (
						<div className="loading">Loading...</div>
					) : reviews.length === 0 ? (
						<div className="no-reviews">
							<p>No approved reviews available for this property yet.</p>
							<Link to="/" className="dashboard-link">
								Go to Dashboard to approve reviews
							</Link>
						</div>
					) : (
						<div className="reviews-grid">
							{reviews.map((review) => (
								<ReviewCard key={review.id} review={review} />
							))}
						</div>
					)}
				</section>
			</main>
		</div>
	);
}

export default ReviewDisplayPage;
