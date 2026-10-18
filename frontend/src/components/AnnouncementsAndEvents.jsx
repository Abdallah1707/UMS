import React, { useState, useEffect } from 'react';
import { communityService } from '../api/communityService';
import './Announcements.css';

const AnnouncementsAndEvents = () => {
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [announcementsData, eventsData] = await Promise.all([communityService.getAnnouncements(), communityService.getEvents()]);
      setAnnouncements(announcementsData);
      setEvents(eventsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="announcements-container">
      <h2>Announcements & Events</h2>
      
      <div className="tabs-container" style={{marginBottom: '20px'}}>
        <button 
          className={`tab ${activeTab === 'announcements' ? 'active' : ''}`} 
          onClick={() => setActiveTab('announcements')}
          style={{padding: '10px 20px', marginRight: '10px', cursor: 'pointer'}}
        >
          Announcements
        </button>
        <button 
          className={`tab ${activeTab === 'events' ? 'active' : ''}`} 
          onClick={() => setActiveTab('events')}
          style={{padding: '10px 20px', cursor: 'pointer'}}
        >
          Events
        </button>
      </div>

      {activeTab === 'announcements' ? (
        announcements.length === 0 ? (
          <div className="no-announcements">No announcements available</div>
        ) : (
          <div className="announcements-list">
            {announcements.map(announcement => (
              <div key={announcement.id} className="announcement-item">
                <div className="announcement-header">
                  <h3>{announcement.title}</h3>
                  <span className="announcement-date">{formatDate(announcement.created_at)}</span>
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
        )
      ) : (
        events.length === 0 ? (
          <div className="no-announcements">No events available</div>
        ) : (
          <div className="announcements-list">
            {events.map(event => (
              <div key={event.id} className="announcement-item">
                <div className="announcement-header">
                  <h3>{event.title}</h3>
                  <span className="announcement-date">{event.event_date} at {event.event_time}</span>
                </div>
                <p className="announcement-content">{event.description}</p>
                <div className="announcement-deadline">
                  <strong>Location:</strong> {event.location}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default AnnouncementsAndEvents;