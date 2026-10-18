import { useState, useEffect } from 'react';
import { staffService } from '../../api/staffService';
import './MyPerformanceReviews.css';

const MyPerformanceReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const data = await staffService.getMyReviews();
      setReviews(data);
    } catch (err) {
      setError('Failed to fetch your performance reviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="my-performance-reviews">
      <h2>My Performance Reviews</h2>

      {error && <div className="error-message">{error}</div>}

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No performance reviews yet</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <span className={`rating-badge rating-${review.rating}`}>
                  {review.rating_display}
                </span>
                <span className="review-date">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="review-period">
                <strong>Review Period:</strong>
                <p>{review.review_period_start} to {review.review_period_end}</p>
              </div>

              <div className="review-reviewer">
                <strong>Reviewed by:</strong>
                <p>{review.reviewer_details?.first_name} {review.reviewer_details?.last_name}</p>
              </div>

              <div className="review-comments">
                <strong>Comments:</strong>
                <p>{review.comments}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPerformanceReviews;
