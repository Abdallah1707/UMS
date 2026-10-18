import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffService } from '../../api/staffService';
import { useAuth } from '../../context/AuthContext';
import './Publications.css';

const Publications = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    journal: '',
    publication_date: '',
    url: '',
    pdf_file: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPublications();
  }, [filterAuthor, filterYear]);

  const fetchPublications = async () => {
    try {
      const params = {};
      if (filterAuthor) params.author = filterAuthor;
      if (filterYear) params.year = filterYear;
      const response = await staffService.getPublications(params);
      setPublications(response.data);
    } catch (err) {
      setError('Failed to load publications');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.url && !formData.pdf_file) {
      setError('Please provide either a URL or upload a PDF file');
      return;
    }
    
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('authors', formData.authors);
      submitData.append('journal', formData.journal);
      submitData.append('publication_date', formData.publication_date);
      if (formData.url) submitData.append('url', formData.url);
      if (formData.pdf_file) submitData.append('pdf_file', formData.pdf_file);
      
      await staffService.createPublication(submitData);
      setSuccess('Publication submitted successfully! DOI has been auto-generated.');
      setShowForm(false);
      setFormData({ title: '', authors: '', journal: '', publication_date: '', url: '', pdf_file: null });
      fetchPublications();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.url?.[0] || err.response?.data?.pdf_file?.[0] || 'Failed to submit publication');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterAuthor('');
    setFilterYear('');
  };

  return (
    <div className="publications-container">
      <div className="publications-header">
        <h2>Research Publications</h2>
        <div>
          <button onClick={() => navigate('/staff/dashboard')} className="btn-primary" style={{marginRight: '10px'}}>← Back to Dashboard</button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? '✕ Cancel' : '+ Submit New Publication'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">⚠ {error}</div>}
      {success && <div className="success-message">✓ {success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="publication-form">
          <h3>Submit New Publication</h3>
          <div className="form-row">
            <div className="form-field">
              <label>Title *</label>
              <input
                type="text"
                placeholder="Enter publication title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Authors *</label>
              <input
                type="text"
                placeholder="e.g., John Doe, Jane Smith, Robert Brown"
                value={formData.authors}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                required
              />
              <small>Separate multiple authors with commas</small>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Journal *</label>
              <input
                type="text"
                placeholder="Enter journal name"
                value={formData.journal}
                onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Publication Date *</label>
              <input
                type="date"
                value={formData.publication_date}
                onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>URL (optional if PDF provided)</label>
              <input
                type="url"
                placeholder="https://example.com/publication"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>PDF File (optional if URL provided)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFormData({ ...formData, pdf_file: e.target.files[0] })}
              />
              {formData.pdf_file && <small>Selected: {formData.pdf_file.name}</small>}
            </div>
          </div>
          <div className="form-info">
            <span>ℹ Provide either URL or PDF file (or both). DOI will be auto-generated.</span>
          </div>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Publication'}
          </button>
        </form>
      )}

      <div className="publications-filters">
        <input
          type="text"
          placeholder="🔍 Filter by author name"
          value={filterAuthor}
          onChange={(e) => setFilterAuthor(e.target.value)}
        />
        <input
          type="number"
          placeholder="📅 Filter by year"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        />
        {(filterAuthor || filterYear) && (
          <button onClick={clearFilters} className="btn-clear">Clear Filters</button>
        )}
      </div>

      <div className="publications-list">
        {publications.length === 0 ? (
          <div className="no-publications">No publications found</div>
        ) : (
          publications.map((pub) => (
            <div key={pub.id} className="publication-card">
              <span className={`status-badgee status-${pub.status}`}>{pub.status}</span>
              <h3>{pub.title}</h3>
              <div className="publication-meta">
                <p><strong>Authors:</strong> {pub.authors}</p>
                <p><strong>Journal:</strong> {pub.journal}</p>
                <p><strong>Date:</strong> {new Date(pub.publication_date).toLocaleDateString()}</p>
                <p><strong>DOI:</strong> <code>{pub.doi}</code></p>
                {pub.url && <p><strong>URL:</strong> <a href={pub.url} target="_blank" rel="noopener noreferrer">View Online</a></p>}
                {pub.pdf_file_url && <p><strong>PDF:</strong> <a href={pub.pdf_file_url} target="_blank" rel="noopener noreferrer">Download PDF</a></p>}
                <p className="submitted-info">Submitted by {pub.submitted_by_details?.username} on {new Date(pub.submitted_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Publications;
