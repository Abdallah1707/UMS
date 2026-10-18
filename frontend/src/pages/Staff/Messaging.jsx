import React, { useState, useEffect } from 'react';
import { communityService } from '../../api/communityService';
import { curriculumService } from '../../api/curriculumService';
import './Messaging.css';

const Messaging = () => {
  const [view, setView] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [replyContent, setReplyContent] = useState({ subject: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [availableContacts, setAvailableContacts] = useState({ students: [], parents: [] });
  const [composeData, setComposeData] = useState({ recipient: '', subject: '', content: '' });
  const [recipientType, setRecipientType] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [announcementData, setAnnouncementData] = useState({ subject: '', content: '', target_type: 'students', course_id: '' });
  const [professorCourses, setProfessorCourses] = useState([]);

  useEffect(() => {
    if (view === 'inbox') loadInbox();
    else if (view === 'sent') loadSent();
    else if (view === 'compose') loadAvailableContacts();
    else if (view === 'announcement') loadProfessorCourses();
  }, [view]);

  const loadAvailableContacts = async () => {
    setLoading(true);
    try {
      const response = await communityService.getAvailableStudents();
      setAvailableContacts(response.data);
    } catch (error) {
      console.error('Error loading contacts:', error);
      alert('Error loading contacts: ' + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  const loadProfessorCourses = async () => {
    try {
      const coursesResponse = await curriculumService.getCourses();
      setProfessorCourses(coursesResponse.data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
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

  const loadConversation = async (studentId, studentDetails) => {
    try {
      const response = await communityService.getConversation(studentId);
      setConversation(response.data);
      setSelectedStudent(studentDetails);
      setView('conversation');
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !replyContent.subject || !replyContent.content) return;

    setLoading(true);
    try {
      await communityService.sendMessage({
        recipient: selectedStudent.id,
        subject: replyContent.subject,
        content: replyContent.content,
      });
      setReplyContent({ subject: '', content: '' });
      loadConversation(selectedStudent.id, selectedStudent);
    } catch (error) {
      alert('Error sending reply');
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (selectedRecipients.length === 0 || !composeData.subject || !composeData.content) return;

    setLoading(true);
    try {
      for (const recipientId of selectedRecipients) {
        await communityService.sendMessage({
          recipient: recipientId,
          subject: composeData.subject,
          content: composeData.content
        });
      }
      setComposeData({ recipient: '', subject: '', content: '' });
      setSelectedRecipients([]);
      setRecipientType('');
      alert(`Messages sent to ${selectedRecipients.length} recipients!`);
      setView('sent');
    } catch (error) {
      alert('Error sending message');
    }
    setLoading(false);
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementData.subject || !announcementData.content) return;

    setLoading(true);
    try {
      const response = await communityService.sendAnnouncement(announcementData);
      setAnnouncementData({ subject: '', content: '', target_type: 'students' });
      alert(`Announcement sent to ${response.data.recipients_count} recipients!`);
      setView('sent');
    } catch (error) {
      console.error('Error sending announcement:', error);
      alert('Error sending announcement: ' + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  return (
    <div className="messaging-container">
      <div className="messaging-sidebar">
        <button onClick={() => setView('inbox')} className={view === 'inbox' ? 'active' : ''}>Inbox</button>
        <button onClick={() => setView('sent')} className={view === 'sent' ? 'active' : ''}>Sent</button>
        <button onClick={() => setView('compose')} className={view === 'compose' ? 'active' : ''}>Compose</button>
        <button onClick={() => setView('announcement')} className={view === 'announcement' ? 'active' : ''}>Announcement</button>
      </div>

      <div className="messaging-content">
        {view === 'inbox' && (
          <div className="inbox-view">
            <h2>Inbox</h2>
            {loading ? <p>Loading...</p> : messages.length === 0 ? <p>No messages</p> : (
              <div className="message-list">
                {messages.map(msg => (
                  <div key={msg.id} className={`message-item ${!msg.is_read ? 'unread' : ''}`} onClick={() => { handleMarkAsRead(msg.id); loadConversation(msg.sender, msg.sender_details); }}>
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
                      <div onClick={() => loadConversation(msg.recipient, msg.recipient_details)}>
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

        {view === 'conversation' && selectedStudent && (
          <div className="conversation-view">
            <h2>Conversation with {selectedStudent.first_name} {selectedStudent.last_name}</h2>
            <div className="conversation-messages">
              {conversation.map(msg => (
                <div key={msg.id} className={`conversation-message ${msg.sender === selectedStudent.id ? 'received' : 'sent'}`}>
                  <strong>{msg.subject}</strong>
                  <p>{msg.content}</p>
                  <small>{new Date(msg.created_at).toLocaleString()}</small>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendReply} className="reply-form">
              <input type="text" placeholder="Subject" value={replyContent.subject} onChange={(e) => setReplyContent({...replyContent, subject: e.target.value})} required />
              <textarea placeholder="Reply" value={replyContent.content} onChange={(e) => setReplyContent({...replyContent, content: e.target.value})} rows="4" required />
              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reply'}
              </button>
            </form>
          </div>
        )}

        {view === 'compose' && (
          <div className="compose-view">
            <h2>Compose Message</h2>
            {loading ? <p>Loading contacts...</p> : (
            <form onSubmit={handleSendMessage} className="compose-form">
              <select value={recipientType} onChange={(e) => { setRecipientType(e.target.value); setSelectedRecipients([]); }} required>
                <option value="">Select Recipient Type</option>
                <option value="students">Students</option>
                <option value="parents">Parents</option>
              </select>
              
              {recipientType && (
                <div className="recipient-selection">
                  <div className="select-all-container">
                    <button 
                      type="button"
                      className="select-all-btn"
                      onClick={() => {
                        const allIds = recipientType === 'students' 
                          ? availableContacts.students?.map(s => s.id) || []
                          : availableContacts.parents?.map(p => p.id) || [];
                        
                        if (selectedRecipients.length === allIds.length) {
                          setSelectedRecipients([]);
                        } else {
                          setSelectedRecipients(allIds);
                        }
                      }}
                    >
                      {selectedRecipients.length === (recipientType === 'students' ? availableContacts.students?.length : availableContacts.parents?.length) 
                        ? `Deselect All ${recipientType}` 
                        : `Select All ${recipientType}`}
                    </button>
                  </div>
                  <div className="recipient-list">
                    {(recipientType === 'students' ? availableContacts.students : availableContacts.parents)?.map(contact => (
                      <label key={contact.id} className="recipient-item">
                        <input 
                          type="checkbox" 
                          checked={selectedRecipients.includes(contact.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRecipients([...selectedRecipients, contact.id]);
                            } else {
                              setSelectedRecipients(selectedRecipients.filter(id => id !== contact.id));
                            }
                          }}
                        />
                        {contact.name} ({contact.email})
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <input type="text" placeholder="Subject" value={composeData.subject} onChange={(e) => setComposeData({...composeData, subject: e.target.value})} required />
              <textarea placeholder="Message content" value={composeData.content} onChange={(e) => setComposeData({...composeData, content: e.target.value})} rows="6" required />
              <button type="submit" disabled={loading || selectedRecipients.length === 0}>
                {loading ? 'Sending...' : `Send to ${selectedRecipients.length} Recipients`}
              </button>
            </form>
            )}
          </div>
        )}

        {view === 'announcement' && (
          <div className="announcement-view">
            <h2>Send Announcement</h2>
            <form onSubmit={handleSendAnnouncement} className="announcement-form">
              <select value={announcementData.course_id} onChange={(e) => setAnnouncementData({...announcementData, course_id: e.target.value})} required>
                <option value="">Select Course</option>
                {professorCourses.map(course => (
                  <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                ))}
              </select>
              <select value={announcementData.target_type} onChange={(e) => setAnnouncementData({...announcementData, target_type: e.target.value})}>
                <option value="students">Students Only</option>
                <option value="parents">Parents Only</option>
                <option value="all">All Students & Parents</option>
              </select>
              <input type="text" placeholder="Announcement Subject" value={announcementData.subject} onChange={(e) => setAnnouncementData({...announcementData, subject: e.target.value})} required />
              <textarea placeholder="Announcement content" value={announcementData.content} onChange={(e) => setAnnouncementData({...announcementData, content: e.target.value})} rows="6" required />
              <button type="submit" disabled={loading || !announcementData.course_id}>
                {loading ? 'Sending...' : 'Send Announcement'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
