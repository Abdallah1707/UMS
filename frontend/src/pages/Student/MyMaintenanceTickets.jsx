import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { facilitiesService } from '../../api/facilitiesService';
import './MyMaintenanceTickets.css';

const MyMaintenanceTickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await facilitiesService.getMaintenanceTickets();
      setTickets(response.data);
    } catch (err) {
      setError('Failed to fetch tickets');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'status-pending',
      in_progress: 'status-progress',
      resolved: 'status-resolved'
    };
    return badges[status] || '';
  };

  return (
    <div className="my-maintenance-tickets">
      <button onClick={() => navigate(`/${user?.user_type}/dashboard`)} className="back-btn">← Back to Dashboard</button>
      <h1>My Maintenance Tickets</h1>

      {error && <div className="error-message">{error}</div>}

      {tickets.length === 0 ? (
        <p>No maintenance tickets found.</p>
      ) : (
        <div className="tickets-list">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-header">
                <h3>{ticket.title}</h3>
                <span className={`status-badge ${getStatusBadge(ticket.status)}`}>
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p><strong>Location:</strong> {ticket.location}</p>
              <p><strong>Description:</strong> {ticket.description}</p>
              <p><strong>Submitted:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
              <p><strong>Last Updated:</strong> {new Date(ticket.updated_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMaintenanceTickets;
