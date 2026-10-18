import { useState, useEffect } from 'react';
import { staffService } from '../../api/staffService';
import { coreService } from '../../api/coreService';
import './PerformanceReviewManagement.css';

const PerformanceReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ staff_member: '', start_date: '', end_date: '' });
  const [formData, setFormData] = useState({
    staff_member: '',
    rating: '',
    review_period_start: '',
    review_period_end: '',
    comments: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReviews();
    fetchStaffMembers();
  }, []);

  const fetchReviews = async (filterParams = {}) => {
    try {
      const data = await staffService.getAllReviews(filterParams);
      setReviews(data);
    } catch (err) {
      setError('Failed to fetch reviews');
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const professors = await coreService.getUsers('professor');
      const tas = await coreService.getUsers('ta');
      setStaffMembers([...professors, ...tas]);
    } catch (err) {
      setError('Failed to fetch staff members');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await staffService.createReview(formData);
      setSuccess('Performance review created successfully');
      setShowForm(false);
      setFormData({ staff_member: '', rating: '', review_period_start: '', review_period_end: '', comments: '' });
      fetchReviews(filters);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create review');
    }
  };

  const handleFilter = () => {
    const filterParams = {};
    if (filters.staff_member) filterParams.staff_member = filters.staff_member;
    if (filters.start_date) filterParams.start_date = filters.start_date;
    if (filters.end_date) filterParams.end_date = filters.end_date;
    fetchReviews(filterParams);
  };

  const clearFilters = () => {
    setFilters({ staff_member: '', start_date: '', end_date: '' });
    fetchReviews();
  };

  return (
    <div className="performance-review-management">
      <h2>Performance Review Management</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="actions">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Create New Review'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label>Staff Member *</label>
            <select value={formData.staff_member} onChange={(e) => setFormData({ ...formData, staff_member: e.target.value })} required>
              <option value="">Select Staff Member</option>
              {staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.first_name} {staff.last_name} ({staff.user_type})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Rating *</label>
            <select value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} required>
              <option value="">Select Rating</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Below Average</option>
              <option value="3">3 - Average</option>
              <option value="4">4 - Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Review Period Start *</label>
              <input type="date" value={formData.review_period_start} onChange={(e) => setFormData({ ...formData, review_period_start: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Review Period End *</label>
              <input type="date" value={formData.review_period_end} onChange={(e) => setFormData({ ...formData, review_period_end: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label>Comments *</label>
            <textarea value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} rows="4" required />
          </div>

          <button type="submit" className="btn-primary">Submit Review</button>
        </form>
      )}

      <div className="filters">
        <h3>Filter Reviews</h3>
        <div className="filter-row">
          <select value={filters.staff_member} onChange={(e) => setFilters({ ...filters, staff_member: e.target.value })}>
            <option value="">All Staff Members</option>
            {staffMembers.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.first_name} {staff.last_name}
              </option>
            ))}
          </select>
          <input type="date" placeholder="Start Date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} />
          <input type="date" placeholder="End Date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} />
          <button onClick={handleFilter} className="btn-secondary">Apply Filters</button>
          <button onClick={clearFilters} className="btn-secondary">Clear</button>
        </div>
      </div>

      <div className="reviews-list">
        <h3>Performance Reviews</h3>
        {reviews.length === 0 ? (
          <p>No reviews found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Rating</th>
                <th>Period</th>
                <th>Reviewer</th>
                <th>Date</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.staff_member_details?.first_name} {review.staff_member_details?.last_name}</td>
                  <td><span className={`rating rating-${review.rating}`}>{review.rating_display}</span></td>
                  <td>{review.review_period_start} to {review.review_period_end}</td>
                  <td>{review.reviewer_details?.first_name} {review.reviewer_details?.last_name}</td>
                  <td>{new Date(review.created_at).toLocaleDateString()}</td>
                  <td className="comments">{review.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PerformanceReviewManagement;
