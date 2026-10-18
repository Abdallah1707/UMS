import React, { useState, useEffect } from 'react';
import { staffService } from '../../api/staffService';
import './StudentPublications.css';

const StudentPublications = () => {
  const [publications, setPublications] = useState([]);
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublications();
  }, [filterAuthor, filterYear]);

  const fetchPublications = async () => {
    setLoading(true);
    try {
      const params = { status: 'approved' };
      if (filterAuthor) params.author = filterAuthor;
      if (filterYear) params.year = filterYear;
      const response = await staffService.getPublications(params);
      setPublications(response.data.filter(p => p.status === 'approved'));
    } catch (err) {
      console.error('Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterAuthor('');
    setFilterYear('');
  };

  return (
    <div className="student-publications-container">
      <h2>University Research Publications</h2>
      <p className="subtitle">Browse approved research publications from our faculty</p>

      <div className="publications-filters">
        <input
          type="text"
          placeholder="🔍 Search by author name"
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

      {loading ? (
        <div className="loading">Loading publications...</div>
      ) : publications.length === 0 ? (
        <div className="no-publications">No publications found</div>
      ) : (
        <div className="publications-list">
          {publications.map((pub) => (
            <div key={pub.id} className="publication-card">
              <h3>{pub.title}</h3>
              <div className="publication-meta">
                <p><strong>Authors:</strong> {pub.authors}</p>
                <p><strong>Journal:</strong> {pub.journal}</p>
                <p><strong>Publication Date:</strong> {new Date(pub.publication_date).toLocaleDateString()}</p>
                <p><strong>DOI:</strong> <code>{pub.doi}</code></p>
                <div className="publication-links">
                  {pub.url && (
                    <a href={pub.url} target="_blank" rel="noopener noreferrer" className="btn-link">
                      🔗 View Online
                    </a>
                  )}
                  {pub.pdf_file_url && (
                    <a href={pub.pdf_file_url} target="_blank" rel="noopener noreferrer" className="btn-link">
                      📄 Download PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentPublications;
