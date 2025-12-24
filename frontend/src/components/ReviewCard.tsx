import { Review } from '../types/review';
import './ReviewCard.css';

interface ReviewCardProps {
  review: Review;
}

function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRatingColor = (rating: number | null) => {
    if (rating === null) return '#999';
    if (rating >= 4.5) return '#10b981';
    if (rating >= 4.0) return '#3b82f6';
    if (rating >= 3.0) return '#f59e0b';
    return '#ef4444';
  };

  const formatCategoryName = (category: string) => {
    return category
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-name">{review.guestName}</div>
          <div className="review-date">{formatDate(review.submittedAt)}</div>
        </div>
        {review.overallRating !== null && (
          <div
            className="review-rating"
            style={{ backgroundColor: getRatingColor(review.overallRating) }}
          >
            {review.overallRating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="review-comment">{review.comment}</div>

      {Object.keys(review.categories).length > 0 && (
        <div className="review-categories">
          {Object.entries(review.categories).map(([category, rating]) => (
            <div key={category} className="category-item">
              <span className="category-name">{formatCategoryName(category)}</span>
              <div className="category-bar">
                <div
                  className="category-fill"
                  style={{
                    width: `${(rating / 5) * 100}%`,
                    backgroundColor: getRatingColor(rating),
                  }}
                />
              </div>
              <span className="category-value">{rating}/5</span>
            </div>
          ))}
        </div>
      )}

      <div className="review-type">
        {review.type === 'guest-to-host' ? 'Guest Review' : 'Host Review'}
      </div>
    </div>
  );
}

export default ReviewCard;

