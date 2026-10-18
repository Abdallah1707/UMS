import React, { useState, useEffect } from 'react';
import { curriculumService } from '../../api/curriculumService';
import './Grades.css';

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [gpa, setGpa] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    const filtered = grades.filter(grade =>
      grade.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.course_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGrades(filtered);
  }, [grades, searchTerm]);

  const fetchGrades = async () => {
    try {
      const data = await curriculumService.getStudentGrades();
      setGrades(data.grades);
      setGpa(data.gpa);
      setTotalCredits(data.total_credits);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch grades');
      setLoading(false);
    }
  };

  const formatGrade = (grade) => {
    return grade !== null ? grade : '-';
  };

  const handleGenerateTranscript = async () => {
    setGenerating(true);
    try {
      const response = await curriculumService.generateTranscript();
      
      if (response.status === 200 || response.status === 201) {
        alert('Transcript generated successfully! Check your email.');
      } else {
        alert(response.data?.errors?.detail?.[0] || 'Failed to generate transcript');
      }
    } catch (err) {
      alert('Failed to generate transcript. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="loading">Loading grades...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="grades-container">
      <h2>My Grades</h2>
      
      <div className="stats-cards">
        <div className="stats-card">
          <h3>GPA</h3>
          <p className="stats-value">{gpa.toFixed(2)}</p>
        </div>
        <div className="stats-card">
          <h3>Total Credit Hours</h3>
          <p className="stats-value">{totalCredits}</p>
        </div>
      </div>

      <button 
        onClick={handleGenerateTranscript} 
        disabled={generating}
        className="generate-transcript-btn"
      >
        {generating ? 'Generating...' : 'Generate Transcript'}
      </button>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by course name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="grades-list">
        {filteredGrades.length === 0 ? (
          <div className="no-grades">No grades found</div>
        ) : (
          filteredGrades.map((grade, index) => (
            <div key={index} className="grade-card">
              <div className="course-info">
                <h3>{grade.course_name}</h3>
                <p className="course-code">{grade.course_code}</p>
              </div>
              <div className="grade-boxes">
                <div className="grade-box">
                  <span className="grade-label">Midterm</span>
                  <span className="grade-value">{formatGrade(grade.midterm)}</span>
                </div>
                <div className="grade-box">
                  <span className="grade-label">Project</span>
                  <span className="grade-value">{formatGrade(grade.project)}</span>
                </div>
                <div className="grade-box">
                  <span className="grade-label">Coursework</span>
                  <span className="grade-value">{formatGrade(grade.coursework)}</span>
                </div>
                <div className="grade-box">
                  <span className="grade-label">Final Grade</span>
                  <span className="grade-value">{formatGrade(grade.final_grade)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Grades;