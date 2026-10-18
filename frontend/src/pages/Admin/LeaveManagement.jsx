import React, { useState, useEffect } from 'react';
import { staffService } from '../../api/staffService';
import './LeaveManagement.css';

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filter, setFilter] = useState({ status: '', staff: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
  }, [filter]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.staff) params.staff = filter.staff;
      
      const response = await staffService.getLeaveRequests(params);
      setLeaveRequests(response.data);
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this leave request?')) return;
    
    try {
      await staffService.approveLeave(id);
      fetchLeaveRequests();
    } catch (err) {
      alert('Failed to approve leave request');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this leave request?')) return;
    
    try {
      await staffService.rejectLeave(id);
      fetchLeaveRequests();
    } catch (err) {
      alert('Failed to reject leave request');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected'
    };
    return badges[status] || '';
  };

  return (
    <div className="leave-management-container">
      <h2>Leave Requests Management</h2>

      <div className="filters">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : leaveRequests.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <table className="leave-management-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((request) => (
              <tr key={request.id}>
                <td>
                  {request.staff_details?.first_name} {request.staff_details?.last_name}
                  <br />
                  <small>({request.staff_details?.username})</small>
                </td>
                <td>{request.leave_type_display}</td>
                <td>{new Date(request.start_date).toLocaleDateString()}</td>
                <td>{new Date(request.end_date).toLocaleDateString()}</td>
                <td>{request.reason}</td>
                <td>
                  <span className={`status-badge ${getStatusBadge(request.status)}`}>
                    {request.status_display}
                  </span>
                </td>
                <td>{new Date(request.created_at).toLocaleDateString()}</td>
                <td>
                  {request.status === 'pending' && (
                    <div className="action-buttons">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="approve-btn"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="reject-btn"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {request.status !== 'pending' && (
                    <span className="reviewed-text">
                      Reviewed by {request.reviewed_by_details?.username}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaveManagement;
