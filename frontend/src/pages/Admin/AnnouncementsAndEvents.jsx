import React, { useState, useEffect } from 'react';
import { communityService } from '../../api/communityService';
import './AnnouncementManagement.css';

const AnnouncementsAndEvents = () => {
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    target_audience: 'all',
    deadline: '',
    is_published: true
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAudience, setFilterAudience] = useState('all');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'announcements') {
        if (editingId) {
          await communityService.updateAnnouncement(editingId, formData);
        } else {
          await communityService.createAnnouncement(formData);
        }
      } else {
        if (editingId) {
          await communityService.updateEvent(editingId, formData);
        } else {
          await communityService.createEvent(formData);
        }
      }
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleEdit = (item) => {
    if (activeTab === 'announcements') {
      setFormData({
        title: item.title,
        content: item.content,
        target_audience: item.target_audience,
        deadline: item.deadline ? item.deadline.slice(0, 16) : '',
        is_published: item.is_published
      });
    } else {
      setFormData({
        title: item.title,
        description: item.description,
        event_date: item.event_date,
        event_time: item.event_time,
        location: item.location,
        target_audience: item.target_audience
      });
    }
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab === 'announcements' ? 'announcement' : 'event'}?`)) {
      try {
        if (activeTab === 'announcements') {
          await communityService.deleteAnnouncement(id);
        } else {
          await communityService.deleteEvent(id);
        }
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', description: '', event_date: '', event_time: '', location: '', target_audience: 'all', deadline: '', is_published: true });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredItems = () => {
    const items = activeTab === 'announcements' ? announcements : events;
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterAudience === 'all' || item.target_audience === filterAudience;
      return matchesSearch && matchesFilter;
    });
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="announcement-management">
      <div className="header">
        <h2>Announcements & Events</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Create {activeTab === 'announcements' ? 'Announcement' : 'Event'}
        </button>
      </div>

      <div className="tabs-container">
        <button className={`tab ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}>
          Announcements
        </button>
        <button className={`tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
          Events
        </button>
      </div>

      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search by title or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterAudience}
          onChange={(e) => setFilterAudience(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Audiences</option>
          <option value="student">Students</option>
          <option value="staff">Staff</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {showForm && (
        <div className="form-overlay">
          <form onSubmit={handleSubmit} className="announcement-form">
            <h3>{editingId ? 'Edit' : 'Create'} {activeTab === 'announcements' ? 'Announcement' : 'Event'}</h3>
            
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            
            {activeTab === 'announcements' ? (
              <>
                <textarea
                  placeholder="Content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  required
                />
                <input
                  type="datetime-local"
                  placeholder="Deadline (optional)"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                  />
                  Published
                </label>
              </>
            ) : (
              <>
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <input
                  type="date"
                  placeholder="Event Date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  required
                />
                <input
                  type="time"
                  placeholder="Event Time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({...formData, event_time: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </>
            )}
            
            <select
              value={formData.target_audience}
              onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
            >
              <option value="all">All Users</option>
              <option value="student">Students</option>
              <option value="staff">Staff</option>
              <option value="admin">Admins</option>
            </select>
            
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="announcements-list">
        {filteredItems().length === 0 ? (
          <p className="no-results">No {activeTab} found.</p>
        ) : activeTab === 'announcements' ? (
          filteredItems().map(announcement => (
            <div key={announcement.id} className="announcement-card">
              <div className="announcement-header">
                <h3>{announcement.title}</h3>
                <div className="announcement-meta">
                  <span className={`status ${announcement.is_published ? 'published' : 'unpublished'}`}>
                    {announcement.is_published ? 'Published' : 'Unpublished'}
                  </span>
                  <span className="target">{announcement.target_audience}</span>
                </div>
              </div>
              <p>{announcement.content}</p>
              <div className="announcement-actions">
                <button onClick={() => handleEdit(announcement)} className="btn-edit">Edit</button>
                <button onClick={() => handleDelete(announcement.id)} className="btn-delete">Delete</button>
              </div>
            </div>
          ))
        ) : (
          filteredItems().map(event => (
            <div key={event.id} className="announcement-card">
              <div className="announcement-header">
                <h3>{event.title}</h3>
                <div className="announcement-meta">
                  <span className="target">{event.target_audience}</span>
                </div>
              </div>
              <p>{event.description}</p>
              <p><strong>Date:</strong> {event.event_date} at {event.event_time}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <div className="announcement-actions">
                <button onClick={() => handleEdit(event)} className="btn-edit">Edit</button>
                <button onClick={() => handleDelete(event.id)} className="btn-delete">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsAndEvents;