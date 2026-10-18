import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { curriculumService } from '../../api/curriculumService';
import './AssignmentSubmit.css';

const AssignmentSubmit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchAssignmentAndSubmission();
  }, [id]);

  const fetchAssignmentAndSubmission = async () => {
    try {
      const assignmentRes = await curriculumService.getAssignment(id);
      setAssignment(assignmentRes.data);

      try {
        const submissionRes = await curriculumService.getSubmission(id);
        setSubmission(submissionRes.data);
        setTextContent(submissionRes.data.text_content || '');
        setIsEditing(false);
      } catch (err) {
        setSubmission(null);
        setIsEditing(true);
      }
    } catch (error) {
      setMessage('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if due date has passed using current time
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    
    // Ensure both dates are valid
    if (isNaN(dueDate.getTime())) {
      setMessage('Invalid due date. Please contact your instructor.');
      return;
    }
    
    // Add a small buffer (1 minute) to account for any timing issues
    const bufferTime = 60 * 1000; // 1 minute in milliseconds
    const isOverdue = now.getTime() > (dueDate.getTime() + bufferTime);
    
    if (isOverdue) {
      setMessage('Submissions are no longer accepted. The due date has passed.');
      return;
    }

    if (!textContent && !file) {
      setMessage('Please provide either text content or upload a file');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('text_content', textContent);
      if (file) {
        formData.append('file', file);
      }

      await curriculumService.submitAssignment(id, formData);
      setMessage('Submission successful! Your work has been submitted.');
      setIsEditing(false);
      await fetchAssignmentAndSubmission();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!assignment) return <div className="error">Assignment not found</div>;

  return (
    <div className="assignment-submit">
      <button className="btn-back" onClick={() => navigate('/student/dashboard?view=myCourses')}>
        ← Back to Dashboard
      </button>

      <div className="assignment-details">
        <h2>{assignment.title}</h2>
        <span className={`type-badge ${assignment.assignment_type}`}>
          {assignment.assignment_type.toUpperCase()}
        </span>
        
        <div className="course-info">
          <strong>{assignment.course_code}</strong> - {assignment.course_name}
        </div>

        <div className="description">
          <h3>Description</h3>
          <p>{assignment.description}</p>
        </div>

        {assignment.instructions && (
          <div className="instructions">
            <h3>Instructions</h3>
            <p>{assignment.instructions}</p>
          </div>
        )}

        <div className="due-info">
          <div className="due-date">
            <strong>Due:</strong> {new Date(assignment.due_date).toLocaleString()}
          </div>
          <div className={`time-remaining ${assignment.is_overdue ? 'overdue' : ''}`}>
            {assignment.time_remaining}
          </div>
        </div>
      </div>

      {submission && (
        <div className="existing-submission">
          <h3>Your Submission</h3>
          <p><strong>Submitted at:</strong> {new Date(submission.submitted_at).toLocaleString()}</p>
          {submission.text_content && (
            <div className="submitted-text">
              <strong>Text Content:</strong>
              <p>{submission.text_content}</p>
            </div>
          )}
          {submission.file_url && (
            <div className="submitted-file">
              <strong>File:</strong> <a href={submission.file_url} target="_blank" rel="noopener noreferrer">View File</a>
            </div>
          )}
          {submission.grade !== null && submission.grade !== undefined && (
            <div className="grade-display">
              <strong>Grade:</strong> <span className="grade-value">{submission.grade}/100</span>
            </div>
          )}
          {submission.feedback && (
            <div className="feedback-display">
              <strong>Instructor Feedback:</strong>
              <p>{submission.feedback}</p>
            </div>
          )}
      {(() => {
        const now = new Date();
        const dueDate = new Date(assignment.due_date);
        return now.getTime() <= dueDate.getTime();
      })() && (
        <div className="resubmit-actions">
          <button 
            className="btn-resubmit" 
            onClick={() => setIsEditing(true)}
          >
            Resubmit Assignment
          </button>
        </div>
      )}
        </div>
      )}

      {(() => {
        const now = new Date();
        const dueDate = new Date(assignment.due_date);
        const isOverdue = now.getTime() > dueDate.getTime();
        return !isOverdue && (!submission || isEditing);
      })() ? (
        <form onSubmit={handleSubmit} className="submission-form">
          <h3>{submission ? 'Resubmit Assignment' : 'Submit Assignment'}</h3>

          <div className="form-group">
            <label>Text Submission</label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter your answer or submission text here..."
              rows="10"
            />
          </div>

          <div className="form-group">
            <label>Upload File (Optional)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file && <p className="file-name">Selected: {file.name}</p>}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Submitting...' : (submission ? 'Resubmit' : 'Submit')}
            </button>
            {submission && (
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (() => {
        const now = new Date();
        const dueDate = new Date(assignment.due_date);
        const isOverdue = now.getTime() > dueDate.getTime();
        return isOverdue && !submission;
      })() ? (
        <div className="overdue-message">
          <p>Submissions are no longer accepted. The due date has passed.</p>
        </div>
      ) : null}

      {message && (
        <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmit;
