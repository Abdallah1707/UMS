import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { curriculumService } from '../../api/curriculumService';
import './SubmissionReview.css';

const SubmissionReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [assignmentRes, submissionsRes] = await Promise.all([
        curriculumService.getAssignment(id),
        curriculumService.getAssignmentSubmissions(id)
      ]);
      setAssignment(assignmentRes.data);
      setSubmissions(submissionsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeClick = (submission) => {
    setGradingSubmission(submission);
    setGradeData({
      grade: submission.grade || '',
      feedback: submission.feedback || ''
    });
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      await curriculumService.gradeSubmission(gradingSubmission.id, gradeData);
      await fetchData();
      setGradingSubmission(null);
      setGradeData({ grade: '', feedback: '' });
    } catch (error) {
      console.error('Failed to save grade:', error);
      alert('Failed to save grade');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!assignment) return <div className="error">Assignment not found</div>;

  return (
    <div className="submission-review">
      <button className="btn-back" onClick={() => navigate('/staff/dashboard?view=courses')}>
        ← Back to Dashboard
      </button>

      <div className="assignment-info">
        <h2>{assignment.title}</h2>
        <p>{assignment.course_code} - {assignment.course_name}</p>
        <p><strong>Due:</strong> {new Date(assignment.due_date).toLocaleString()}</p>
      </div>

      <div className="submissions-section">
        <h3>Submissions ({submissions.length})</h3>
        
        {submissions.length === 0 ? (
          <p className="no-submissions">No submissions yet</p>
        ) : (
          <div className="submissions-list">
            {submissions.map(submission => (
              <div key={submission.id} className="submission-card">
                <div className="submission-header">
                  <div>
                    <h4>{submission.student_name}</h4>
                    <p className="student-id">ID: {submission.student_id}</p>
                  </div>
                  <div className="submission-meta">
                    <p className="submitted-at">
                      Submitted: {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                    {submission.grade && (
                      <span className="grade-badge">Grade: {submission.grade}</span>
                    )}
                  </div>
                </div>

                {submission.text_content && (
                  <div className="text-content">
                    <strong>Text Submission:</strong>
                    <p>{submission.text_content}</p>
                  </div>
                )}

                {submission.file_url && (
                  <div className="file-submission">
                    <strong>File:</strong>
                    <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="file-link">
                      📄 Open File
                    </a>
                  </div>
                )}

                {submission.feedback && (
                  <div className="feedback-display">
                    <strong>Feedback:</strong>
                    <p>{submission.feedback}</p>
                  </div>
                )}

                <button 
                  className="btn-grade"
                  onClick={() => handleGradeClick(submission)}
                >
                  {submission.grade ? 'Update Grade' : 'Add Grade'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {gradingSubmission && (
        <div className="grade-modal">
          <div className="grade-modal-content">
            <h3>Grade Submission - {gradingSubmission.student_name}</h3>
            <form onSubmit={handleGradeSubmit}>
              <div className="form-group">
                <label>Grade (0-100):</label>
                <input
                  type="number"
                  value={gradeData.grade}
                  onChange={(e) => setGradeData({...gradeData, grade: e.target.value})}
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Feedback:</label>
                <textarea
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
                  rows="5"
                  placeholder="Provide feedback to the student..."
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-save">Save Grade</button>
                <button type="button" className="btn-cancel" onClick={() => setGradingSubmission(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionReview;
