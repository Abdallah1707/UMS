import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { curriculumService } from '../../api/curriculumService';
import './QuizSubmissionReview.css';

const QuizSubmissionReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [quizRes, submissionsRes] = await Promise.all([
        quizService.getQuiz(id),
        curriculumService.getQuizSubmissions(id)
      ]);
      setQuiz(quizRes.data);
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
      await curriculumService.gradeQuizSubmission(gradingSubmission.id, gradeData);
      await fetchData();
      setGradingSubmission(null);
      setGradeData({ grade: '', feedback: '' });
    } catch (error) {
      console.error('Failed to save grade:', error);
    }
  };

  const handleCancel = () => {
    setGradingSubmission(null);
    setGradeData({ grade: '', feedback: '' });
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="quiz-submission-review">
      <div className="header">
        <button onClick={() => navigate('/staff/dashboard?view=courses')} className="back-btn">← Back to Dashboard</button>
        <h2>{quiz?.title} - Submissions</h2>
      </div>

      <div className="submissions-section">
        <h3>Submissions ({submissions.length})</h3>

        {submissions.length === 0 ? (
          <p className="no-submissions">No submissions yet</p>
        ) : (
          <div className="submissions-list">
            {submissions.map(submission => (
              <div key={submission.id} className="submission-item">
                <div className="submission-header">
                  <div className="student-info">
                    <h4>{submission.student_name}</h4>
                    <p className="student-id">ID: {submission.student_id}</p>
                  </div>
                  <div className="submission-meta">
                    <p>Submitted: {new Date(submission.submitted_at).toLocaleString()}</p>
                    {submission.grade ? (
                      <div className="grade-display">
                        <span className="grade">Grade: {submission.grade}</span>
                        {submission.feedback && (
                          <p className="feedback">Feedback: {submission.feedback}</p>
                        )}
                      </div>
                    ) : (
                      <span className="no-grade">Not graded yet</span>
                    )}
                  </div>
                </div>

                <div className="answers-section">
                  <h5>Answers:</h5>
                  <div className="answers-list">
                    {Object.entries(submission.answers || {}).map(([questionId, answer]) => (
                      <div key={questionId} className="answer-item">
                        <span className="question-id">Question {questionId}:</span>
                        <span className="answer">{answer}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="submission-actions">
                  <button
                    onClick={() => handleGradeClick(submission)}
                    className="grade-btn"
                  >
                    {submission.grade ? 'Update Grade' : 'Grade'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {gradingSubmission && (
        <div className="grading-modal">
          <div className="grading-content">
            <h3>Grade Submission</h3>
            <p><strong>Student:</strong> {gradingSubmission.student_name}</p>

            <form onSubmit={handleGradeSubmit}>
              <div className="form-group">
                <label>Grade:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={gradeData.grade}
                  onChange={(e) => setGradeData({...gradeData, grade: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Feedback:</label>
                <textarea
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">Save Grade</button>
                <button type="button" onClick={handleCancel} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSubmissionReview;