import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { communityService } from '../../api/communityService';
import './ParentDashboard.css';

const ParentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    
    // Refresh count when returning to this page
    const handleFocus = () => loadUnreadCount();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await communityService.getInbox();
      const unread = response.data.filter(msg => !msg.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h2>Parent Dashboard</h2>
        <div className="nav-user">
          <span>Welcome, {user?.first_name || user?.username}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Parent Portal</h1>
        <p>Welcome to the parent dashboard. Here you can monitor your child's academic progress.</p>
        
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Student Progress</h3>
            <p>View your child's grades and academic performance</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/parent/attendance')} style={{ cursor: "pointer" }}>
            <h3>Attendance</h3>
            <p>Monitor attendance records and schedules</p>
          </div>

          <div className="dashboard-card" onClick={() => { navigate('/parent/messaging'); }} style={{ cursor: "pointer", position: 'relative' }}>
            <h3>Teacher Communication</h3>
            <p>Send messages to your child's teachers</p>
            {unreadCount > 0 && <span className="card-notification-badge">{unreadCount}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;