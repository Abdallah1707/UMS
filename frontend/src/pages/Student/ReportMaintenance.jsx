import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { facilitiesService } from '../../api/facilitiesService';
import './ReportMaintenance.css';

const ReportMaintenance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: ''
  });
  const [classrooms, setClassrooms] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await facilitiesService.getClassrooms();
        setClassrooms(response.data);
      } catch (err) {
        console.error('Failed to fetch classrooms:', err);
      }
    };
    fetchClassrooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await facilitiesService.createMaintenanceTicket(formData);
      setSuccess('Maintenance ticket submitted successfully');
      setFormData({ title: '', description: '', location: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to submit ticket';
      setError(errorMsg);
      console.error('Error submitting ticket:', err.response?.data);
    }
  };

  const getDashboardPath = () => {
    const userType = user?.user_type;
    if (userType === 'professor' || userType === 'ta') return '/staff/dashboard';
    return `/${userType}/dashboard`;
  };

  return (
    <div className="report-maintenance">
      <button onClick={() => navigate(getDashboardPath())} className="back-btn">← Back to Dashboard</button>
      <h1>Report Maintenance Issue</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="maintenance-form">
        <input
          type="text"
          placeholder="Issue Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <select
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
        >
          <option value="">Select Location</option>
          {classrooms.map((classroom) => (
            <option key={classroom.id} value={`${classroom.name} - ${classroom.building}`}>
              {classroom.name} - {classroom.building}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows="5"
          required
        />
        <button type="submit" className="btn-primary">Submit Ticket</button>
      </form>
    </div>
  );
};

export default ReportMaintenance;
