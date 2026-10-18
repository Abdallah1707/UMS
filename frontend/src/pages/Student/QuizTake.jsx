import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { curriculumService } from '../../api/curriculumService';
import './QuizTake.css';

const QuizTake = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const [quizResponse, questionsResponse] = await Promise.all([
        curriculumService.getQuiz(quizId),
        curriculumService.getQuizQuestions(quizId)
      ]);

      setQuiz(quizResponse.data);
      setQuestions(questionsResponse.data);

      // Check if already submitted
      const submissionsResponse = await curriculumService.getQuizSubmissionsList();
      const userSubmission = submissionsResponse.data.find(sub => sub.quiz === parseInt(quizId) && sub.student === parseInt(localStorage.getItem('user_id')));
      if (userSubmission) {
        setAlreadySubmitted(true);
        setSubmission(userSubmission);
      } else {
        // Initialize answers
        const initialAnswers = {};
        questionsResponse.data.forEach(q => {
          initialAnswers[q.id] = q.question_type === 'mcq' ? '' : '';
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
      alert('Failed to load quiz.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await curriculumService.submitQuiz({
        quiz: quizId,
        answers: answers
      });
      alert('Quiz submitted successfully!');
      navigate('/student/dashboard?view=myCourses');
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading quiz...</div>;

  if (alreadySubmitted) {
    return (
      <div className="quiz-take-container">
        <div className="quiz-header">
          <button onClick={() => navigate('/student/dashboard?view=myCourses')} className="back-button">← Back</button>
          <h2>{quiz.title}</h2>
        </div>

        <div className="submission-result">
          <h3>Quiz Submitted</h3>
          <p>Submitted on: {new Date(submission.submitted_at).toLocaleString()}</p>
          {submission.grade ? (
            <div className="grade-display">
              <h4>Grade: {submission.grade}</h4>
              {submission.feedback && <p>Feedback: {submission.feedback}</p>}
            </div>
          ) : (
            <p>Grade not yet available.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-take-container">
      <div className="quiz-header">
        <button onClick={() => navigate('/student/dashboard?view=myCourses')} className="back-button">← Back</button>
        <h2>{quiz.title}</h2>
        <p>{quiz.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="quiz-form">
        {questions.map((question, index) => (
          <div key={question.id} className="question-card">
            <h4>Question {index + 1}: {question.question_text}</h4>

            {question.question_type === 'mcq' && question.options && (
              <div className="options">
                {question.options.map((option, optIndex) => (
                  <label key={optIndex} className="option">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      required
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            {question.question_type === 'text' && (
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder="Enter your answer"
                required
              />
            )}
          </div>
        ))}

        <div className="submit-section">
          <button type="submit" disabled={submitting} className="submit-quiz-btn">
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizTake;