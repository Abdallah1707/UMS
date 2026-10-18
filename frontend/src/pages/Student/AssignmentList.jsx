import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { curriculumService } from '../../api/curriculumService';
import './AssignmentList.css';

const AssignmentList = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      console.log('Fetching assignments...');
      const response = await curriculumService.getAssignments();
      console.log('Assignments response:', response.data);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    if (filter === 'assignments') return assignment.assignment_type === 'assignment';
    if (filter === 'exams') return assignment.assignment_type === 'exam';
    if (filter === 'overdue') return assignment.is_overdue;
    return true;
  });

  return (
    <div className="assignment-list">
      <div className="header">
        <div className="header-left">
          <button 
            className="btn-back" 
            onClick={() => navigate('/student/dashboard?view=courses')}
          >
            ← Back to Dashboard
          </button>
          <h2>My Assignments</h2>
        </div>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'assignments' ? 'active' : ''}
            onClick={() => setFilter('assignments')}
          >
            Assignments
          </button>
          <button 
            className={filter === 'exams' ? 'active' : ''}
            onClick={() => setFilter('exams')}
          >
            Exams
          </button>
          <button 
            className={filter === 'overdue' ? 'active' : ''}
            onClick={() => setFilter('overdue')}
          >
            Overdue
          </button>
        </div>
      </div>

      <div className="debug-info">
        <p>Total assignments: {assignments.length}</p>
        <p>Filtered assignments: {filteredAssignments.length}</p>
        <p>Current filter: {filter}</p>
      </div>
      
      {filteredAssignments.length === 0 ? (
        <div className="no-assignments">
          <p>No assignments found for the selected filter.</p>
          <p>Total assignments in system: {assignments.length}</p>
        </div>
      ) : (
        <div className="assignments-grid">
          {filteredAssignments.map(assignment => (
            <div key={assignment.id} className={`assignment-card ${assignment.assignment_type} ${assignment.is_overdue ? 'overdue' : ''}`}>
              <div className="assignment-header">
                <h3>{assignment.title}</h3>
                <span className={`type-badge ${assignment.assignment_type}`}>
                  {assignment.assignment_type.toUpperCase()}
                </span>
              </div>
              
              <div className="course-info">
                <strong>{assignment.course_code}</strong> - {assignment.course_name}
              </div>
              
              <div className="description">
                {assignment.description}
              </div>
              
              <div className="due-date-section">
                <div className="due-date">
                  <strong>Due: </strong>
                  {new Date(assignment.due_date).toLocaleString()}
                </div>
                <div className={`time-remaining ${assignment.is_overdue ? 'overdue' : ''}`}>
                  {assignment.time_remaining}
                </div>
              </div>
              
              {assignment.instructions && (
                <div className="instructions">
                  <strong>Instructions:</strong>
                  <p>{assignment.instructions}</p>
                </div>
              )}
              
              {assignment.attachment && (
                <div className="attachment">
                  <strong>Attachment:</strong>
                  <a href={assignment.attachment} target="_blank" rel="noopener noreferrer" className="attachment-link">
                    📄 View PDF
                  </a>
                </div>
              )}
              
              <div className="created-by">
                Created by: {assignment.created_by_name}
              </div>
              
              <button 
                className="btn-submit"
                onClick={() => navigate(`/student/assignments/${assignment.id}/submit`)}
              >
                {assignment.is_overdue ? 'View Details' : 'Submit Assignment'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentList;