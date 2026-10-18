import { useState, useEffect } from 'react';
import { facilitiesService } from '../../api/facilitiesService';

const MaintenanceManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await facilitiesService.getMaintenanceTickets();
      setTickets(response.data);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await facilitiesService.updateMaintenanceTicket(id, { status });
      fetchTickets();
    } catch (err) {
      console.error('Failed to update ticket:', err);
    }
  };

  if (loading) return <div className="loading">Loading tickets...</div>;

  return (
    <div className="management-section">
      {tickets.length === 0 ? (
        <div className="no-data">No maintenance tickets found</div>
      ) : (
        <div className="tickets-table">
          <div className="table-header">
            <div>Title</div>
            <div>Location</div>
            <div>Reported By</div>
            <div>Date</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {tickets.map(ticket => (
            <div key={ticket.id} className="table-row">
              <div>{ticket.title}</div>
              <div>{ticket.location}</div>
              <div>{ticket.user_name}</div>
              <div>{new Date(ticket.created_at).toLocaleDateString()}</div>
              <div>
                <span className={`status-badge ${ticket.status}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <div className="actions">
                <select 
                  value={ticket.status} 
                  onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenanceManagement;
