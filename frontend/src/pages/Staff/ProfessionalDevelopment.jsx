import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffService } from '../../api/staffService';
import './ProfessionalDevelopment.css';

const ProfessionalDevelopment = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [myDevelopment, setMyDevelopment] = useState({ completed: [], planned: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, filterType]);

  const fetchData = async () => {
    try {
      const activitiesRes = await staffService.getActivities();
      setActivities(activitiesRes.data);
      
      try {
        const myDevRes = await staffService.getMyDevelopment();
        setMyDevelopment(myDevRes.data);
      } catch (err) {
        console.log('Could not fetch registrations');
      }
    } catch (err) {
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    if (filterType === 'all') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(a => a.activity_type === filterType));
    }
  };

  const handleRegister = async (activityId) => {
    try {
      await staffService.registerForActivity(activityId);
      setSuccess('Successfully registered for activity');
      setError('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to register');
      setSuccess('');
    }
  };

  const handleUpdateStatus = async (registrationId, status) => {
    if (status === 'completed' && !feedbackModal) {
      setFeedbackModal(registrationId);
      return;
    }
    
    try {
      await staffService.updateRegistrationStatus(registrationId, status, feedback);
      setSuccess(`Status updated to ${status}`);
      setError('');
      setFeedbackModal(null);
      setFeedback('');
      fetchData();
    } catch (err) {
      setError('Failed to update status');
      setSuccess('');
    }
  };

  const isRegistered = (activityId) => {
    return [...myDevelopment.completed, ...myDevelopment.planned].some(
      reg => reg.activity === activityId
    );
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="professional-development">
      <button onClick={() => navigate('/staff/dashboard')} className="back-btn">← Back to Dashboard</button>
      <h1>Professional Development</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <section className="my-development">
        <h2>My Development History</h2>
        
        <div className="development-section">
          <h3>Planned Activities ({myDevelopment.planned.length})</h3>
          {myDevelopment.planned.map(reg => (
            <div key={reg.id} className="activity-card">
              <h4>{reg.activity_details.title}</h4>
              <p><strong>Type:</strong> {reg.activity_details.activity_type}</p>
              <p><strong>Date:</strong> {new Date(reg.activity_details.start_date).toLocaleDateString()}</p>
              <div className="actions">
                <button onClick={() => handleUpdateStatus(reg.id, 'completed')}>Mark Completed</button>
                <button onClick={() => handleUpdateStatus(reg.id, 'cancelled')}>Cancel</button>
              </div>
            </div>
          ))}
        </div>

        <div className="development-section">
          <h3>Completed Activities ({myDevelopment.completed.length})</h3>
          {myDevelopment.completed.map(reg => (
            <div key={reg.id} className="activity-card completed">
              <h4>{reg.activity_details.title}</h4>
              <p><strong>Type:</strong> {reg.activity_details.activity_type}</p>
              <p><strong>Date:</strong> {new Date(reg.activity_details.start_date).toLocaleDateString()}</p>
              {reg.certificate_issued && <span className="certificate-badge">✓ Certificate Issued</span>}
              {reg.feedback && (
                <div className="feedback-display">
                  <strong>Feedback:</strong> {reg.feedback}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="available-activities">
        <h2>Available Activities</h2>
        
        <div className="filter-buttons">
          <button className={filterType === 'all' ? 'active' : ''} onClick={() => setFilterType('all')}>All</button>
          <button className={filterType === 'workshop' ? 'active' : ''} onClick={() => setFilterType('workshop')}>Workshops</button>
          <button className={filterType === 'conference' ? 'active' : ''} onClick={() => setFilterType('conference')}>Conferences</button>
          <button className={filterType === 'certification' ? 'active' : ''} onClick={() => setFilterType('certification')}>Certifications</button>
        </div>

        {filteredActivities.map(activity => (
          <div key={activity.id} className="activity-card">
            <h4>{activity.title}</h4>
            <p><strong>Type:</strong> {activity.activity_type}</p>
            <p><strong>Description:</strong> {activity.description}</p>
            <p><strong>Dates:</strong> {new Date(activity.start_date).toLocaleDateString()} - {new Date(activity.end_date).toLocaleDateString()}</p>
            <p><strong>Capacity:</strong> {activity.max_capacity === 0 ? 'Unlimited' : `${activity.current_registrations}/${activity.max_capacity}`}</p>
            {activity.is_full && <span className="full-badge">FULL</span>}
            {!isRegistered(activity.id) && !activity.is_full && (
              <button onClick={() => handleRegister(activity.id)}>Register</button>
            )}
            {isRegistered(activity.id) && <span className="registered-badge">Registered</span>}
          </div>
        ))}
      </section>

      {feedbackModal && (
        <div className="modal-overlay" onClick={() => setFeedbackModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Feedback (Optional)</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience with this activity..."
              rows="4"
            />
            <div className="modal-actions">
              <button onClick={() => handleUpdateStatus(feedbackModal, 'completed')}>Complete</button>
              <button onClick={() => setFeedbackModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalDevelopment;
