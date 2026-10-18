import React, { useState, useEffect } from 'react';
import { communityService } from '../../api/communityService';
import './AnnouncementManagement.css';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_audience: 'all',
    deadline: '',
    is_published: true
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await communityService.updateAnnouncement(editingId, formData);
      } else {
        await communityService.createAnnouncement(formData);
      }
      fetchAnnouncements();
      resetForm();
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      target_audience: announcement.target_audience,
      deadline: announcement.deadline ? announcement.deadline.slice(0, 16) : '',
      is_published: announcement.is_published
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await communityService.deleteAnnouncement(id);
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', target_audience: 'all', deadline: '', is_published: true });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Loading announcements...</div>;

  return (
    <div className="announcement-management">
      <div className="header">
        <h2>Announcement Management</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Create Announcement
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <form onSubmit={handleSubmit} className="announcement-form">
            <h3>{editingId ? 'Edit' : 'Create'} Announcement</h3>
            
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            
            <textarea
              placeholder="Content"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            />
            
            <select
              value={formData.target_audience}
              onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
            >
              <option value="all">All Users</option>
              <option value="student">Students</option>
              <option value="staff">Staff</option>
              <option value="admin">Admins</option>
            </select>
            
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
        {announcements.map(announcement => (
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
              <button onClick={() => handleEdit(announcement)} className="btn-edit">
                Edit
              </button>
              <button onClick={() => handleDelete(announcement.id)} className="btn-delete">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementManagement;