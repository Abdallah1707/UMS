import { useState, useEffect } from 'react';
import { staffService } from '../../api/staffService';
import './ProfessionalDevelopmentManagement.css';

const ProfessionalDevelopmentManagement = () => {
  const [activities, setActivities] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    activity_type: 'workshop',
    description: '',
    start_date: '',
    end_date: '',
    max_capacity: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [activitiesRes, registrationsRes] = await Promise.all([
        staffService.getActivities(),
        staffService.getMyRegistrations()
      ]);
      setActivities(activitiesRes.data);
      setRegistrations(registrationsRes.data);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        max_capacity: formData.max_capacity === '' ? 0 : parseInt(formData.max_capacity)
      };
      await staffService.createActivity(data);
      setSuccess('Activity created successfully');
      setShowForm(false);
      setFormData({ title: '', activity_type: 'workshop', description: '', start_date: '', end_date: '', max_capacity: '' });
      fetchData();
    } catch (err) {
      setError('Failed to create activity');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this activity?')) return;
    try {
      await staffService.deleteActivity(id);
      setSuccess('Activity deleted');
      fetchData();
    } catch (err) {
      setError('Failed to delete activity');
    }
  };

  const getActivityRegistrations = (activityId) => {
    return registrations.filter(reg => reg.activity === activityId);
  };

  const toggleExpand = (activityId) => {
    setExpandedActivity(expandedActivity === activityId ? null : activityId);
  };

  const handleIssueCertificate = async (registrationId) => {
    try {
      await staffService.issueCertificate(registrationId);
      setSuccess('Certificate issued successfully');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to issue certificate');
    }
  };

  return (
    <div className="pd-management">
      <h1>Professional Development Management</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button onClick={() => setShowForm(!showForm)} className="create-btn">
        {showForm ? 'Cancel' : 'Create New Activity'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="activity-form">
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <select
            value={formData.activity_type}
            onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
          >
            <option value="workshop">Workshop</option>
            <option value="conference">Conference</option>
            <option value="certification">Certification</option>
          </select>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Max Capacity (leave empty for unlimited)"
            value={formData.max_capacity}
            onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
            min="1"
          />
          <button type="submit">Create Activity</button>
        </form>
      )}

      <div className="activities-list">
        <h2>All Activities</h2>
        {activities.map(activity => {
          const activityRegs = getActivityRegistrations(activity.id);
          const isExpanded = expandedActivity === activity.id;
          return (
            <div key={activity.id} className="activity-item">
              <h3>{activity.title}</h3>
              <p><strong>Type:</strong> {activity.activity_type}</p>
              <p><strong>Description:</strong> {activity.description}</p>
              <p><strong>Dates:</strong> {new Date(activity.start_date).toLocaleDateString()} - {new Date(activity.end_date).toLocaleDateString()}</p>
              <p><strong>Capacity:</strong> {activity.max_capacity === 0 ? 'Unlimited' : `${activity.current_registrations}/${activity.max_capacity}`}</p>
              <p><strong>Registrations:</strong> {activityRegs.length}</p>
              <div className="activity-actions">
                <button onClick={() => toggleExpand(activity.id)} className="view-btn">
                  {isExpanded ? 'Hide' : 'View'} Registrations
                </button>
                <button onClick={() => handleDelete(activity.id)} className="delete-btn">Delete</button>
              </div>
              {isExpanded && (
                <div className="registrations-list">
                  <h4>Registered Staff:</h4>
                  {activityRegs.length === 0 ? (
                    <p>No registrations yet</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Username</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Feedback</th>
                          <th>Certificate</th>
                          <th>Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityRegs.map(reg => (
                          <tr key={reg.id}>
                            <td>{reg.staff_details.first_name} {reg.staff_details.last_name}</td>
                            <td>{reg.staff_details.username}</td>
                            <td>{reg.staff_details.user_type}</td>
                            <td><span className={`status-badge ${reg.status}`}>{reg.status}</span></td>
                            <td>{reg.feedback || 'N/A'}</td>
                            <td>
                              {reg.status === 'completed' && (
                                reg.certificate_issued ? (
                                  <span className="cert-issued">✓ Issued</span>
                                ) : (
                                  <button onClick={() => handleIssueCertificate(reg.id)} className="cert-btn">Issue</button>
                                )
                              )}
                            </td>
                            <td>{new Date(reg.registered_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfessionalDevelopmentManagement;
