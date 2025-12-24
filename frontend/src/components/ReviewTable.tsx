import { Review } from '../types/review';
import './ReviewTable.css';

interface ReviewTableProps {
  reviews: Review[];
  onToggleApproval: (reviewId: number) => void;
}

function ReviewTable({ reviews, onToggleApproval }: ReviewTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  if (reviews.length === 0) {
    return (
      <div className="empty-state">
        <p>No reviews match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="review-table-container">
      <table className="review-table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Guest</th>
            <th>Rating</th>
            <th>Categories</th>
            <th>Comment</th>
            <th>Date</th>
            <th>Type</th>
            <th>Approved</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id} className={review.approved ? 'approved' : ''}>
              <td className="property-cell">
                <div className="property-name">{review.propertyName}</div>
              </td>
              <td className="guest-cell">{review.guestName}</td>
              <td className="rating-cell">
                {review.overallRating !== null ? (
                  <span
                    className="rating-badge"
                    style={{ backgroundColor: getRatingColor(review.overallRating) }}
                  >
                    {review.overallRating.toFixed(1)}
                  </span>
                ) : (
                  <span className="no-rating">—</span>
                )}
              </td>
              <td className="categories-cell">
                <div className="categories-list">
                  {Object.entries(review.categories).map(([category, rating]) => (
                    <div key={category} className="category-item">
                      <span className="category-name">
                        {formatCategoryName(category)}:
                      </span>
                      <span className="category-rating">{rating}</span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="comment-cell">
                <div className="comment-text">{review.comment || '—'}</div>
              </td>
              <td className="date-cell">{formatDate(review.submittedAt)}</td>
              <td className="type-cell">
                <span className="type-badge">
                  {review.type === 'guest-to-host' ? 'Guest → Host' : 'Host → Guest'}
                </span>
              </td>
              <td className="approval-cell">
                <button
                  className={`approval-toggle ${review.approved ? 'approved' : 'not-approved'}`}
                  onClick={() => onToggleApproval(review.id)}
                  title={review.approved ? 'Click to unapprove' : 'Click to approve'}
                >
                  {review.approved ? '✓ Approved' : '○ Approve'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReviewTable;

