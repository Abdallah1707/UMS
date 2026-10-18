import React, { useState, useEffect } from 'react';
import { communityService } from '../api/communityService';
import './Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await communityService.getAnnouncements();
      setAnnouncements(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading announcements...</div>;

  return (
    <div className="announcements-container">
      <h2>Announcements</h2>
      {announcements.length === 0 ? (
        <div className="no-announcements">No announcements available</div>
      ) : (
        <div className="announcements-list">
          {announcements.map(announcement => (
            <div key={announcement.id} className="announcement-item">
              <div className="announcement-header">
                <h3>{announcement.title}</h3>
                <span className="announcement-date">
                  {formatDate(announcement.created_at)}
                </span>
              </div>
              <p className="announcement-content">{announcement.content}</p>
              {announcement.deadline && (
                <div className="announcement-deadline">
                  <strong>Deadline:</strong> {formatDate(announcement.deadline)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;