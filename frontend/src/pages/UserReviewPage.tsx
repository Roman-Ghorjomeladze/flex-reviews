import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser, useReviewsByUser } from "../hooks/useReviews";
import ReviewCard from "../components/ReviewCard";
import Pagination from "../components/Pagination";
import "./UserReviewPage.css";

function UserReviewPage() {
	const { userId } = useParams<{ userId: string }>();
	const [page, setPage] = useState(1);
	const limit = 10; // Reviews per page

	const { data: user, isLoading: userLoading } = useUser(userId);
	const { data: reviewsData, isLoading: reviewsLoading, error } = useReviewsByUser(userId, page, limit);

	const reviews = reviewsData?.data || [];
	const pagination = reviewsData?.pagination || {
		page: 1,
		limit: limit,
		total: 0,
		totalPages: 1,
	};

	const userName = user?.userName || userId || "User";

	// Calculate average rating from actual reviews instead of using stored value
	const calculateAverageRating = () => {
		if (reviews.length === 0) return null;
		const ratings = reviews.map((r) => r.overallRating).filter((r) => r !== null && r !== undefined) as number[];
		if (ratings.length === 0) return null;
		const sum = ratings.reduce((acc, rating) => acc + rating, 0);
		return sum / ratings.length;
	};

	const averageRating = calculateAverageRating();

	const loading = reviewsLoading || userLoading;

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	useEffect(() => {
		// Reset page to 1 when userId changes
		setPage(1);
	}, [userId]);

	return (
		<div className="user-review-page">
			<header className="user-header">
				<Link to="/" className="back-link">
					← Back to Dashboard
				</Link>
				<div className="user-info">
					<h1>{userName} Reviews</h1>
					{(user || reviewsData) && (
						<div className="user-stats">
							{averageRating !== null && (
								<div className="user-rating">
									<span className="rating-value">{averageRating.toFixed(1)}</span>
									<span className="rating-label">average rating</span>
								</div>
							)}
							<span className="review-count">
								{pagination.total} review{pagination.total !== 1 ? "s" : ""}
							</span>
						</div>
					)}
				</div>
			</header>

			<main className="user-content">
				<section className="reviews-section">
					<h2>All Reviews</h2>
					{error && <div className="error-message">Error loading reviews: {error.message}</div>}
					{loading ? (
						<div className="loading">Loading...</div>
					) : reviews.length === 0 ? (
						<div className="no-reviews">
							<p>No reviews found for this user.</p>
							<Link to="/" className="dashboard-link">
								Go to Dashboard
							</Link>
						</div>
					) : (
						<>
							<div className="reviews-grid">
								{reviews.map((review) => (
									<ReviewCard key={review.id} review={review} />
								))}
							</div>
							<Pagination
								page={pagination.page}
								totalPages={pagination.totalPages}
								onPageChange={handlePageChange}
								total={pagination.total}
								limit={pagination.limit}
							/>
						</>
					)}
				</section>
			</main>
		</div>
	);
}

export default UserReviewPage;
