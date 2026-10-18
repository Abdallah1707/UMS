import React, { useState, useEffect } from 'react';
import { communityService } from '../../api/communityService';
import './Messaging.css';

const Messaging = ({ onMessageRead }) => {
  const [view, setView] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState({ subject: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    loadProfessors();
    if (view === 'inbox') loadInbox();
    else if (view === 'sent') loadSent();
    else if (view === 'announcements') loadInbox();
  }, [view]);

  const loadProfessors = async () => {
    try {
      const response = await communityService.getAvailableProfessors();
      // For students, the API returns professors directly as an array
      setProfessors(response.data.teachers || response.data || []);
    } catch (error) {
      console.error('Error loading professors:', error);
      setProfessors([]);
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

  const loadConversation = async (professorId) => {
    try {
      const response = await communityService.getConversation(professorId);
      setConversation(response.data);
      setSelectedProfessor(professors.find(p => p.id === professorId));
      setView('conversation');
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedProfessor || !newMessage.subject || !newMessage.content) return;

    setLoading(true);
    try {
      await communityService.sendMessage({
        recipient: selectedProfessor.id,
        subject: newMessage.subject,
        content: newMessage.content,
      });
      setNewMessage({ subject: '', content: '' });
      setReplyingTo(null);
      if (view === 'conversation') {
        loadConversation(selectedProfessor.id);
      } else {
        setView('inbox');
        loadInbox();
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
      if (onMessageRead) onMessageRead();
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
      <div className="messaging-sidebar">
        <button onClick={() => setView('compose')} className="compose-btn">+ New Message</button>
        <button onClick={() => setView('inbox')} className={view === 'inbox' ? 'active' : ''}>
          Inbox
          {view !== 'sent' && messages.filter(msg => !msg.is_read && !msg.subject.startsWith('[Announcement]')).length > 0 && (
            <span className="notification-badge">{messages.filter(msg => !msg.is_read && !msg.subject.startsWith('[Announcement]')).length}</span>
          )}
        </button>
        <button onClick={() => setView('announcements')} className={view === 'announcements' ? 'active' : ''}>
          Announcements
          {view !== 'sent' && messages.filter(msg => !msg.is_read && msg.subject.startsWith('[Announcement]')).length > 0 && (
            <span className="notification-badge">{messages.filter(msg => !msg.is_read && msg.subject.startsWith('[Announcement]')).length}</span>
          )}
        </button>
        <button onClick={() => setView('sent')} className={view === 'sent' ? 'active' : ''}>Sent</button>
      </div>

      <div className="messaging-content">
        {view === 'compose' && (
          <div className="compose-view">
            <h2>New Message</h2>
            {professors.length === 0 ? (
              <p>Loading professors or no professors available...</p>
            ) : (
              <>
                <select onChange={(e) => setSelectedProfessor(professors.find(p => p.id === parseInt(e.target.value)))} value={selectedProfessor?.id || ''}>
                  <option value="">Select Professor</option>
                  {professors.map(prof => (
                    <option key={prof.id} value={prof.id}>
                      {prof.name || `${prof.first_name} ${prof.last_name}`}
                    </option>
                  ))}
                </select>
                <input 
                  type="text" 
                  placeholder="Subject" 
                  value={newMessage.subject} 
                  onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})} 
                />
                <textarea 
                  placeholder="Message" 
                  value={newMessage.content} 
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})} 
                  rows="10" 
                />
                <button onClick={handleSendMessage} disabled={!selectedProfessor || loading}>
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
                {messages
                  .filter(msg => !msg.subject.startsWith('[Announcement]'))
                  .reduce((unique, msg) => {
                    const existing = unique.find(u => u.sender === msg.sender);
                    if (!existing || new Date(msg.created_at) > new Date(existing.created_at)) {
                      return unique.filter(u => u.sender !== msg.sender).concat(msg);
                    }
                    return unique;
                  }, [])
                  .map(msg => (
                    <div key={msg.sender} className={`message-item ${!msg.is_read ? 'unread' : ''}`} onClick={() => { handleMarkAsRead(msg.id); loadConversation(msg.sender); }}>
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
                      <div>
                        <strong>To: {msg.recipient_details.first_name} {msg.recipient_details.last_name}</strong>
                        <p>{msg.subject}</p>
                      </div>
                      <button className="delete-btn" onClick={() => handleDeleteMessage(msg.id)}>
                        Delete
                      </button>
                    </div>
                    <div className="message-content">
                      <p>{msg.content}</p>
                    </div>
                    <small>{new Date(msg.created_at).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'conversation' && selectedProfessor && (
          <div className="conversation-view">
            <h2>Conversation with {selectedProfessor.first_name} {selectedProfessor.last_name}</h2>
            <div className="conversation-messages">
              {conversation.map(msg => (
                <div key={msg.id} className={`conversation-message ${msg.sender === selectedProfessor.id ? 'received' : 'sent'}`}>
                  <div className="message-header">
                    <strong>{msg.subject}</strong>
                    {msg.sender === selectedProfessor.id && (
                      <button 
                        className="reply-arrow" 
                        onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)}
                        title="Reply to this message"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14 15v4l7-7-7-7v4.1c-5 0-8.5-1.6-11-5.1 1 5 4 10 11 11z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <p>{msg.content}</p>
                  <small>{new Date(msg.created_at).toLocaleString()}</small>
                  
                  {replyingTo === msg.id && (
                    <form onSubmit={handleSendMessage} className="inline-reply-form">
                      <input 
                        type="text" 
                        placeholder="Subject" 
                        value={newMessage.subject} 
                        onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})} 
                        required 
                      />
                      <textarea 
                        placeholder="Reply" 
                        value={newMessage.content} 
                        onChange={(e) => setNewMessage({...newMessage, content: e.target.value})} 
                        rows="3" 
                        required 
                      />
                      <div className="reply-buttons">
                        <button type="submit" disabled={loading}>
                          {loading ? 'Sending...' : 'Send Reply'}
                        </button>
                        <button type="button" onClick={() => setReplyingTo(null)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
