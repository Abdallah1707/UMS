import { useState, useEffect } from 'react';
import { facilitiesService } from '../../api/facilitiesService';
import './MaintenanceTickets.css';

const MaintenanceTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleStatusChange = async (id, newStatus) => {
    try {
      await facilitiesService.updateMaintenanceTicket(id, { status: newStatus });
      setSuccess('Ticket status updated');
      fetchTickets();
    } catch (err) {
      setError('Failed to update ticket');
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
    <div className="maintenance-tickets-admin">
      <h1>Maintenance Tickets</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <table className="tickets-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>User</th>
            <th>Location</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.title}</td>
              <td>{ticket.user_name}</td>
              <td>{ticket.location}</td>
              <td>
                <span className={`status-badge ${getStatusBadge(ticket.status)}`}>
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </span>
              </td>
              <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
              <td>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenanceTickets;
