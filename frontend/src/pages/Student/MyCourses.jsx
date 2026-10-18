import React, { useState, useEffect } from 'react';
import { curriculumService } from '../../api/curriculumService';

import { useNavigate } from 'react-router-dom';
import './MyCourses.css';

const MyCourses = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentView, setCurrentView] = useState(null); // 'assignments', 'quizzes', or 'grades'
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [grades, setGrades] = useState(null);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const [regResponse, courseResponse] = await Promise.all([
        curriculumService.getMyRegistrations(),
        curriculumService.getCourses()
      ]);
      
      const regs = regResponse.data.results || regResponse.data;
      const allCourses = courseResponse.data.results || courseResponse.data;
      
      const myCourses = allCourses.filter(course => 
        regs.some(reg => reg.course === course.id)
      );
      
      setRegistrations(regs);
      setCourses(myCourses);
    } catch (error) {
      console.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseAssignments = async (courseId) => {
    setAssignmentsLoading(true);
    try {
      const response = await curriculumService.getAssignments();
      const courseAssignments = response.data.filter(assignment => assignment.course === courseId);
      
      // Check submission status for each assignment
      const assignmentsWithSubmissionStatus = await Promise.all(
        courseAssignments.map(async (assignment) => {
          try {
            const submissionResponse = await curriculumService.getSubmission(assignment.id);
            return { ...assignment, hasSubmitted: true, submission: submissionResponse.data };
          } catch (error) {
            // 404 means no submission exists
            return { ...assignment, hasSubmitted: false, submission: null };
          }
        })
      );
      
      setAssignments(assignmentsWithSubmissionStatus);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const fetchCourseQuizzes = async (courseId) => {
    setQuizzesLoading(true);
    try {
      const [quizzesResponse, submissionsResponse] = await Promise.all([
        curriculumService.getCourseQuizzes(courseId),
        curriculumService.getQuizSubmissionsList()
      ]);
      
      const quizzesWithSubmissions = quizzesResponse.data.map(quiz => {
        const submission = submissionsResponse.data.find(sub => sub.quiz === quiz.id);
        return { ...quiz, submission };
      });
      
      setQuizzes(quizzesWithSubmissions);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      setQuizzes([]);
    } finally {
      setQuizzesLoading(false);
    }
  };

  const fetchCourseGrades = async (courseId) => {
    setGradesLoading(true);
    try {
      const response = await curriculumService.getCourseGrades(courseId);
      setGrades(response.data);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
      setGrades(null);
    } finally {
      setGradesLoading(false);
    }
  };

  const fetchCourseMaterials = async (courseId) => {
    setMaterialsLoading(true);
    try {
      const response = await curriculumService.getMaterials();
      const courseMaterials = response.data.filter(material => material.course === courseId);
      setMaterials(courseMaterials);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      setMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setCurrentView(null);
  };

  const handleViewAssignments = () => {
    setCurrentView('assignments');
    fetchCourseAssignments(selectedCourse.id);
  };

  const handleViewQuizzes = () => {
    setCurrentView('quizzes');
    fetchCourseQuizzes(selectedCourse.id);
  };

  const handleViewGrades = () => {
    setCurrentView('grades');
    fetchCourseGrades(selectedCourse.id);
  };

  const handleViewMaterials = () => {
    setCurrentView('materials');
    fetchCourseMaterials(selectedCourse.id);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setCurrentView(null);
    setAssignments([]);
    setGrades(null);
  };

  const handleBackToCourseMenu = () => {
    setCurrentView(null);
    setAssignments([]);
    setQuizzes([]);
    setGrades(null);
    setMaterials([]);
  };

  if (loading) return <div className="loading">Loading your courses...</div>;

  if (selectedCourse && currentView === 'assignments') {
    return (
      <div className="my-courses-container">
        <div className="course-header">
          <button onClick={handleBackToCourseMenu} className="back-button">← Back to Course Menu</button>
          <h2>{selectedCourse.code} - {selectedCourse.name} - Assignments</h2>
        </div>

        <div className="assignments-section">
          <h3>Course Assignments</h3>

          {assignmentsLoading ? (
            <div className="loading">Loading assignments...</div>
          ) : (
            <div className="assignments-list">
              {assignments.length === 0 ? (
                <p>No assignments found for this course.</p>
              ) : (
                assignments.map(assignment => (
                  <div key={assignment.id} className={`assignment-item ${assignment.assignment_type}`}>
                    <div className="assignment-info">
                      <h4>{assignment.title}</h4>
                      <p className="description">{assignment.description}</p>
                      <div className="assignment-meta">
                        <span className={`type-badge ${assignment.assignment_type}`}>
                          {assignment.assignment_type.toUpperCase()}
                        </span>
                        <span className="due-date">
                          Due: {new Date(assignment.due_date).toLocaleString()}
                        </span>
                        <span className={`time-remaining ${(() => {
                          const now = new Date();
                          const dueDate = new Date(assignment.due_date);
                          return now > dueDate && !assignment.hasSubmitted ? 'overdue' : '';
                        })()}`}>
                          ({assignment.hasSubmitted && new Date() > new Date(assignment.due_date) ? 'Submitted' : assignment.time_remaining})
                        </span>
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
                      {(() => {
                        const now = new Date();
                        const dueDate = new Date(assignment.due_date);
                        const isOverdue = now > dueDate;
                        const shouldDisable = isOverdue && !assignment.hasSubmitted;
                        
                        return (
                          <button
                            className={`submit-btn ${shouldDisable ? 'disabled' : ''}`}
                            onClick={() => navigate(`/student/assignments/${assignment.id}/submit`)}
                            disabled={shouldDisable}
                          >
                            {assignment.hasSubmitted && !isOverdue ? 'View / Edit Submission' :
                             assignment.hasSubmitted && isOverdue ? 'View Submission' :
                             isOverdue && !assignment.hasSubmitted ? 'Due Date Passed' :
                             'Submit Assignment'}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedCourse && currentView === 'quizzes') {
    return (
      <div className="my-courses-container">
        <div className="course-header">
          <button onClick={handleBackToCourseMenu} className="back-button">← Back to Course Menu</button>
          <h2>{selectedCourse.code} - {selectedCourse.name} - Quizzes</h2>
        </div>

        <div className="quizzes-section">
          <h3>Course Quizzes</h3>

          {quizzesLoading ? (
            <div className="loading">Loading quizzes...</div>
          ) : (
            <div className="quizzes-list">
              {quizzes.length === 0 ? (
                <p>No quizzes found for this course.</p>
              ) : (
                quizzes.map(quiz => (
                  <div key={quiz.id} className="quiz-item">
                    <div className="quiz-info">
                      <h4>{quiz.title}</h4>
                      <p className="description">{quiz.description}</p>
                      <div className="quiz-meta">
                        <span>Due: {new Date(quiz.due_date).toLocaleString()}</span>
                        <span className={`time-remaining ${quiz.is_overdue ? 'overdue' : ''}`}>
                          ({quiz.time_remaining})
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          className={`submit-btn ${quiz.submission ? 'disabled' : ''}`}
                          onClick={() => !quiz.submission && navigate(`/student/quizzes/${quiz.id}/take`)}
                          disabled={quiz.submission || quiz.is_overdue}
                        >
                          {quiz.submission ? 'Submitted' : quiz.is_overdue ? 'Quiz Overdue' : 'Take Quiz'}
                        </button>
                        {quiz.submission?.grade && (
                          <span style={{ fontWeight: 'bold', color: '#28a745' }}>
                            Grade: {quiz.submission.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedCourse && currentView === 'grades') {
    return (
      <div className="my-courses-container">
        <div className="course-header">
          <button onClick={handleBackToCourseMenu} className="back-button">← Back to Course Menu</button>
          <h2>{selectedCourse.code} - {selectedCourse.name} - Grades</h2>
        </div>
        
        <div className="grades-section">
          <h3>Your Grades</h3>
          
          {gradesLoading ? (
            <div className="loading">Loading grades...</div>
          ) : (
            <div className="grades-display">
              {!grades ? (
                <p>No grades available for this course yet.</p>
              ) : (
                <div className="grade-card">
                  <div className="grade-item">
                    <span className="grade-label">Midterm:</span>
                    <span className="grade-value">{grades.midterm || '-'}</span>
                  </div>
                  <div className="grade-item">
                    <span className="grade-label">Project:</span>
                    <span className="grade-value">{grades.project || '-'}</span>
                  </div>
                  <div className="grade-item">
                    <span className="grade-label">Coursework:</span>
                    <span className="grade-value">{grades.coursework || '-'}</span>
                  </div>
                  <div className="grade-item final-grade">
                    <span className="grade-label">Final Grade:</span>
                    <span className="grade-value">{grades.final_grade || '-'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedCourse && currentView === 'materials') {
    return (
      <div className="my-courses-container">
        <div className="course-header">
          <button onClick={handleBackToCourseMenu} className="back-button">← Back to Course Menu</button>
          <h2>{selectedCourse.code} - {selectedCourse.name} - Course Materials</h2>
        </div>

        <div className="materials-section">
          <h3>Course Materials</h3>

          {materialsLoading ? (
            <div className="loading">Loading materials...</div>
          ) : (
            <div className="materials-list">
              {materials.length === 0 ? (
                <p>No materials available for this course yet.</p>
              ) : (
                <>
                  <div className="materials-category">
                    <h4>Lectures</h4>
                    {materials.filter(m => m.material_type === 'lecture').length === 0 ? (
                      <p>No lecture materials available.</p>
                    ) : (
                      materials.filter(m => m.material_type === 'lecture').map(material => (
                        <div key={material.id} className="material-item">
                          <span>📄 {material.title}</span>
                          <a href={material.file_url} target="_blank" rel="noopener noreferrer" className="download-btn">
                            Download
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="materials-category">
                    <h4>Tutorials</h4>
                    {materials.filter(m => m.material_type === 'tutorial').length === 0 ? (
                      <p>No tutorial materials available.</p>
                    ) : (
                      materials.filter(m => m.material_type === 'tutorial').map(material => (
                        <div key={material.id} className="material-item">
                          <span>📄 {material.title}</span>
                          <a href={material.file_url} target="_blank" rel="noopener noreferrer" className="download-btn">
                            Download
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedCourse && !currentView) {
    return (
      <div className="my-courses-container">
        <div className="course-header">
          <button onClick={handleBackToCourses} className="back-button">← Back to Courses</button>
          <h2>{selectedCourse.code} - {selectedCourse.name}</h2>
        </div>
        
        <div className="course-menu">
          <div className="course-details">
            <p className="description">{selectedCourse.description}</p>
            <div className="course-meta">
              <span className={`type-badge ${selectedCourse.course_type}`}>
                {selectedCourse.course_type}
              </span>
              <span>{selectedCourse.department_name}</span>
              <span>{selectedCourse.credits} Credits</span>
              {selectedCourse.has_lab && <span className="lab">Lab</span>}
            </div>
          </div>
          
          <div className="course-actions">
            <button onClick={handleViewAssignments} className="action-button assignments-btn">
              <span className="icon">📝</span>
              <div>
                <h3>View Assignments</h3>
                <p>Check and submit course assignments</p>
              </div>
            </button>

            <button onClick={handleViewQuizzes} className="action-button quizzes-btn">
              <span className="icon">🧠</span>
              <div>
                <h3>View Quizzes</h3>
                <p>Take course quizzes</p>
              </div>
            </button>

            <button onClick={handleViewGrades} className="action-button grades-btn">
              <span className="icon">📊</span>
              <div>
                <h3>View Grades</h3>
                <p>Check your academic performance</p>
              </div>
            </button>

            <button onClick={handleViewMaterials} className="action-button materials-btn">
              <span className="icon">📚</span>
              <div>
                <h3>Course Materials</h3>
                <p>Access lectures and tutorials</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-courses-container">
      <h2>My Registered Courses</h2>
      
      {courses.length === 0 ? (
        <div className="no-courses">
          <p>You haven't registered for any courses yet.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course.id} className="course-card" onClick={() => handleCourseClick(course)}>
              <div className="course-header">
                <h3>{course.code}</h3>
                <span className={`badge ${course.course_type}`}>
                  {course.course_type}
                </span>
              </div>
              <h4>{course.name}</h4>
              <p className="description">{course.description}</p>
              <div className="course-details">
                <div><strong>Department:</strong> {course.department_name}</div>
                <div><strong>Credits:</strong> {course.credits}</div>
                {course.has_lab && <div className="lab-badge">Has Lab</div>}
                {course.instructor_names?.length > 0 && (
                  <div><strong>Instructors:</strong> {course.instructor_names.join(', ')}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;