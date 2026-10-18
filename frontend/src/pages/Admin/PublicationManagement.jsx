import React, { useState, useEffect } from 'react';
import { staffService } from '../../api/staffService';
import './PublicationManagement.css';

const PublicationManagement = () => {
  const [publications, setPublications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    setLoading(true);
    try {
      const response = await staffService.getPublications();
      setPublications(response.data);
    } catch (err) {
      setError('Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await staffService.approvePublication(id);
      setSuccess('Publication approved successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchPublications();
    } catch (err) {
      setError('Failed to approve publication');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this publication?')) {
      try {
        await staffService.rejectPublication(id);
        setSuccess('Publication rejected');
        setTimeout(() => setSuccess(''), 3000);
        fetchPublications();
      } catch (err) {
        setError('Failed to reject publication');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const filteredPublications = publications.filter(pub => {
    if (filter === 'all') return true;
    return pub.status === filter;
  });

  const counts = {
    all: publications.length,
    pending: publications.filter(p => p.status === 'pending').length,
    approved: publications.filter(p => p.status === 'approved').length,
    rejected: publications.filter(p => p.status === 'rejected').length
  };

  return (
    <div className="publication-management-container">
      <div className="management-header">
        <h2>Publication Management</h2>
        <div className="stats">
          <span>Total: {counts.all}</span>
          <span className="pending-count">Pending: {counts.pending}</span>
        </div>
      </div>

      {error && <div className="error-message">⚠ {error}</div>}
      {success && <div className="success-message">✓ {success}</div>}

      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All ({counts.all})
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          Pending ({counts.pending})
        </button>
        <button 
          className={filter === 'approved' ? 'active' : ''} 
          onClick={() => setFilter('approved')}
        >
          Approved ({counts.approved})
        </button>
        <button 
          className={filter === 'rejected' ? 'active' : ''} 
          onClick={() => setFilter('rejected')}
        >
          Rejected ({counts.rejected})
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading publications...</div>
      ) : filteredPublications.length === 0 ? (
        <div className="no-publications">No publications found</div>
      ) : (
        <div className="publications-list">
          {filteredPublications.map((pub) => (
            <div key={pub.id} className="publication-card">
              <span className={`status-badgeee status-${pub.status}`}>{pub.status}</span>
              <h3>{pub.title}</h3>
              <div className="publication-meta">
                <p><strong>Authors:</strong> {pub.authors}</p>
                <p><strong>Journal:</strong> {pub.journal}</p>
                <p><strong>Date:</strong> {new Date(pub.publication_date).toLocaleDateString()}</p>
                <p><strong>DOI:</strong> <code>{pub.doi}</code></p>
                {pub.url && <p><strong>URL:</strong> <a href={pub.url} target="_blank" rel="noopener noreferrer">View Online</a></p>}
                {pub.pdf_file_url && <p><strong>PDF:</strong> <a href={pub.pdf_file_url} target="_blank" rel="noopener noreferrer">Download PDF</a></p>}
                <p className="submitted-info">
                  Submitted by <strong>{pub.submitted_by_details?.username}</strong> on {new Date(pub.submitted_at).toLocaleDateString()}
                </p>
              </div>
              
              {pub.status === 'pending' && (
                <div className="action-buttons">
                  <button onClick={() => handleApprove(pub.id)} className="btn-approve">
                    ✓ Approve
                  </button>
                  <button onClick={() => handleReject(pub.id)} className="btn-reject">
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicationManagement;
