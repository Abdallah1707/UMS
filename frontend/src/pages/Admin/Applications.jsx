import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import './Applications.css';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = () => {
    axiosInstance.get('/core/applications/')
      .then(res => setApplications(res.data))
      .catch(err => {
        console.error(err);
        alert('Failed to load applications');
      });
  };

  const viewDetails = (app) => {
    setSelectedApp(app);
  };

  const closeDetails = () => {
    setSelectedApp(null);
  };

  const updateStatus = (status) => {
    axiosInstance.patch(`/core/applications/${selectedApp.id}/`, { status })
      .then((res) => {
        const updatedApp = res.data;
        setApplications(prev => prev.map(app => 
          app.id === selectedApp.id ? updatedApp : app
        ));
        setSelectedApp(updatedApp);
        alert(`Status updated to ${status.replace('_', ' ')} successfully!`);
      })
      .catch(err => {
        console.error(err);
        alert(err.response?.data?.error || 'Failed to update status');
      });
  };

  return (
    <div className="applications-container">
      <div className="applications-header">
        <h1>Applications</h1>
      </div>

      <div className="applications-table">
        <table>
          <thead>
            <tr>
              <th>Reference #</th>
              <th>Name</th>
              <th>Email</th>
              <th>Program</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id}>
                <td>{app.reference_number}</td>
                <td>{app.first_name} {app.last_name}</td>
                <td>{app.email}</td>
                <td>{app.program_name}</td>
                <td><span className={`status-badge ${app.status}`}>{app.status.replace('_', ' ')}</span></td>
                <td>{new Date(app.submitted_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => viewDetails(app)} className="view-btn">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedApp && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Application Details</h2>
            <div className="details-grid">
              <div className="detail-item">
                <label>Reference Number:</label>
                <span>{selectedApp.reference_number}</span>
              </div>
              <div className="detail-item">
                <label>Name:</label>
                <span>{selectedApp.first_name} {selectedApp.last_name}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{selectedApp.email}</span>
              </div>
              <div className="detail-item">
                <label>Phone:</label>
                <span>{selectedApp.phone}</span>
              </div>
              <div className="detail-item">
                <label>Program:</label>
                <span>{selectedApp.program_name}</span>
              </div>
              <div className="detail-item">
                <label>School Name:</label>
                <span>{selectedApp.school_name}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`status-badge ${selectedApp.status}`}>{selectedApp.status.replace('_', ' ')}</span>
              </div>
              <div className="detail-item">
                <label>Submitted:</label>
                <span>{new Date(selectedApp.submitted_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="documents">
              <h3>Documents</h3>
              {selectedApp.transcript_url ? (
                <a href={selectedApp.transcript_url} target="_blank" rel="noopener noreferrer">View Transcript</a>
              ) : (
                <span style={{color: '#999'}}>No transcript uploaded</span>
              )}
              {selectedApp.id_copy_url ? (
                <a href={selectedApp.id_copy_url} target="_blank" rel="noopener noreferrer">View ID Copy</a>
              ) : (
                <span style={{color: '#999'}}>No ID copy uploaded</span>
              )}
              {selectedApp.photo_url ? (
                <a href={selectedApp.photo_url} target="_blank" rel="noopener noreferrer">View Photo</a>
              ) : (
                <span style={{color: '#999'}}>No photo uploaded</span>
              )}
            </div>

            <div className="status-actions">
              <button onClick={() => updateStatus('in_review')} className="status-btn review" disabled={selectedApp.status === 'accepted' || selectedApp.status === 'rejected'}>In Review</button>
              <button onClick={() => updateStatus('accepted')} className="status-btn accept" disabled={selectedApp.status === 'accepted' || selectedApp.status === 'rejected'}>Accept</button>
              <button onClick={() => updateStatus('rejected')} className="status-btn reject" disabled={selectedApp.status === 'accepted' || selectedApp.status === 'rejected'}>Reject</button>
            </div>

            <button onClick={closeDetails} className="close-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
