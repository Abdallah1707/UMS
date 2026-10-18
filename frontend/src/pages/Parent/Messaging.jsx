import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityService } from '../../api/communityService';
import './Messaging.css';

const ParentMessaging = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [student, setStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState({ subject: '', content: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTeachers();
    if (view === 'inbox') loadInbox();
    else if (view === 'sent') loadSent();
  }, [view]);

  const loadTeachers = async () => {
    try {
      const response = await communityService.getAvailableProfessors();
      setTeachers(response.data.teachers || []);
      setStudent(response.data.student);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const loadInbox = async () => {
    setLoading(true);
    try {
      const response = await communityService.getInbox();
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading inbox:', error);
    }
    setLoading(false);
  };

  const loadSent = async () => {
    setLoading(true);
    try {
      const response = await communityService.getSent();
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading sent messages:', error);
    }
    setLoading(false);
  };

  const loadConversation = async (teacherId) => {
    try {
      const response = await communityService.getConversation(teacherId);
      setConversation(response.data);
      setSelectedTeacher(teachers.find(t => t.id === teacherId));
      setView('conversation');
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedTeacher || !newMessage.subject || !newMessage.content) return;

    setLoading(true);
    try {
      await communityService.sendMessage({
        recipient: selectedTeacher.id,
        subject: newMessage.subject,
        content: newMessage.content,
      });
      setNewMessage({ subject: '', content: '' });
      if (view === 'compose') {
        setView('inbox');
        loadInbox();
      } else {
        loadConversation(selectedTeacher.id);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Error sending message');
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await communityService.markAsRead(messageId);
      loadInbox();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await communityService.deleteMessage(messageId);
        loadSent();
      } catch (error) {
        alert('Error deleting message');
      }
    }
  };

  return (
    <div className="messaging-container">
      {student && (
        <div className="student-context-header">
          <p>Communicating about: <strong>{student.name}</strong></p>
        </div>
      )}
      
      <div className="messaging-sidebar">
        <button onClick={() => navigate('/parent/dashboard')} className="back-btn">← Back to Dashboard</button>
        <button onClick={() => setView('compose')} className="compose-btn">+ New Message</button>
        <button onClick={() => setView('inbox')} className={view === 'inbox' ? 'active' : ''}>
          Inbox
          {messages.filter(msg => !msg.is_read && !msg.subject.startsWith('[Announcement]')).length > 0 && (
            <span className="notification-badge">{messages.filter(msg => !msg.is_read && !msg.subject.startsWith('[Announcement]')).length}</span>
          )}
        </button>
        <button onClick={() => setView('announcements')} className={view === 'announcements' ? 'active' : ''}>
          Announcements
          {messages.filter(msg => !msg.is_read && msg.subject.startsWith('[Announcement]')).length > 0 && (
            <span className="notification-badge">{messages.filter(msg => !msg.is_read && msg.subject.startsWith('[Announcement]')).length}</span>
          )}
        </button>
        <button onClick={() => setView('sent')} className={view === 'sent' ? 'active' : ''}>Sent</button>
      </div>

      <div className="messaging-content">
        {view === 'compose' && (
          <div className="compose-view">
            <h2>New Message to Teacher</h2>
            {teachers.length === 0 ? (
              <p>No teachers available. Your child may not be enrolled in any courses yet.</p>
            ) : (
              <>
                <select onChange={(e) => setSelectedTeacher(teachers.find(t => t.id === parseInt(e.target.value)))} value={selectedTeacher?.id || ''}>
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.user_type})</option>
                  ))}
                </select>
                <input type="text" placeholder="Subject" value={newMessage.subject} onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})} />
                <textarea placeholder="Message" value={newMessage.content} onChange={(e) => setNewMessage({...newMessage, content: e.target.value})} rows="10" />
                <button onClick={handleSendMessage} disabled={!selectedTeacher || loading}>
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </>
            )}
          </div>
        )}

        {view === 'inbox' && (
          <div className="inbox-view">
            <h2>Inbox</h2>
            {loading ? <p>Loading...</p> : messages.filter(msg => !msg.subject.startsWith('[Announcement]')).length === 0 ? <p>No messages</p> : (
              <div className="message-list">
                {messages.filter(msg => !msg.subject.startsWith('[Announcement]')).map(msg => (
                  <div key={msg.id} className={`message-item ${!msg.is_read ? 'unread' : ''}`} onClick={() => { handleMarkAsRead(msg.id); loadConversation(msg.sender); }}>
                    <strong>{msg.sender_details.first_name} {msg.sender_details.last_name}</strong>
                    <p>{msg.subject}</p>
                    <small>{new Date(msg.created_at).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'announcements' && (
          <div className="announcements-view">
            <h2>Announcements</h2>
            {loading ? <p>Loading...</p> : messages.filter(msg => msg.subject.startsWith('[Announcement]')).length === 0 ? <p>No announcements</p> : (
              <div className="message-list">
                {messages.filter(msg => msg.subject.startsWith('[Announcement]')).map(msg => (
                  <div key={msg.id} className={`message-item ${!msg.is_read ? 'unread' : ''}`} onClick={() => { handleMarkAsRead(msg.id); loadConversation(msg.sender); }}>
                    <strong>{msg.sender_details.first_name} {msg.sender_details.last_name}</strong>
                    <p>{msg.subject}</p>
                    <small>{new Date(msg.created_at).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'sent' && (
          <div className="sent-view">
            <h2>Sent Messages</h2>
            {loading ? <p>Loading...</p> : messages.length === 0 ? <p>No sent messages</p> : (
              <div className="message-list">
                {messages.map(msg => (
                  <div key={msg.id} className="message-item">
                    <div className="message-header">
                      <div onClick={() => loadConversation(msg.recipient)}>
                        <strong>To: {msg.recipient_details.first_name} {msg.recipient_details.last_name}</strong>
                        <p>{msg.subject}</p>
                        <small>{new Date(msg.created_at).toLocaleString()}</small>
                      </div>
                      <button className="delete-btn" onClick={() => handleDeleteMessage(msg.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'conversation' && selectedTeacher && (
          <div className="conversation-view">
            <h2>Conversation with {selectedTeacher.name}</h2>
            <div className="conversation-messages">
              {conversation.map(msg => (
                <div key={msg.id} className={`conversation-message ${msg.sender === selectedTeacher.id ? 'received' : 'sent'}`}>
                  <strong>{msg.subject}</strong>
                  <p>{msg.content}</p>
                  <small>{new Date(msg.created_at).toLocaleString()}</small>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="reply-form">
              <input type="text" placeholder="Subject" value={newMessage.subject} onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})} required />
              <textarea placeholder="Reply" value={newMessage.content} onChange={(e) => setNewMessage({...newMessage, content: e.target.value})} rows="4" required />
              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reply'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentMessaging;