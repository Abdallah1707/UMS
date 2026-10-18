import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { curriculumService } from '../../api/curriculumService';
import { useAuth } from '../../context/AuthContext';
import './MyCourses.css';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentView, setCurrentView] = useState(null); // 'students', 'assignments', or 'quizzes'
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [grades, setGrades] = useState([]);
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeValue, setGradeValue] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [isEditingAssignment, setIsEditingAssignment] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentFormData, setAssignmentFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    instructions: ''
  });
  const [selectedAssignmentFile, setSelectedAssignmentFile] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [quizFormData, setQuizFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    questions: []
  });
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    question_type: 'mcq',
    options: [],
    correct_answer: '',
    order: 0,
  });
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [materialFormData, setMaterialFormData] = useState({ title: '', material_type: 'lecture' });
  const [selectedFile, setSelectedFile] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const response = await curriculumService.getCourses();
      const allCourses = response.data.results || response.data;
      const myCourses = allCourses.filter(course => 
        course.instructors?.includes(user.id)
      );
      setCourses(myCourses);
    } catch (error) {
      console.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStudents = async (courseId) => {
    setStudentsLoading(true);
    try {
      const studentsResponse = await curriculumService.getCourseStudents(courseId);
      setStudents(studentsResponse.data);
      setFilteredStudents(studentsResponse.data);
      
      try {
        const gradesResponse = await curriculumService.getCourseGrades(courseId);
        setGrades(gradesResponse.data);
      } catch (gradesError) {
        console.log('Grades not available yet');
        setGrades([]);
      }
    } catch (error) {
      console.error('Failed to fetch course students');
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchCourseAssignments = async (courseId) => {
    setAssignmentsLoading(true);
    try {
      const response = await curriculumService.getCourseAssignments(courseId);
      setAssignments(response.data);
    } catch (error) {
      console.error('Failed to fetch course assignments:', error);
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const fetchCourseQuizzes = async (courseId) => {
    setQuizzesLoading(true);
    try {
      const response = await curriculumService.getCourseQuizzes(courseId);
      setQuizzes(response.data);
    } catch (error) {
      console.error('Failed to fetch course quizzes:', error);
      setQuizzes([]);
    } finally {
      setQuizzesLoading(false);
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setCurrentView(null);
    setSearchTerm('');
  };

  const handleViewStudents = () => {
    setCurrentView('students');
    fetchCourseStudents(selectedCourse.id);
  };

  const handleViewAssignments = () => {
    setCurrentView('assignments');
    fetchCourseAssignments(selectedCourse.id);
  };

  const handleViewQuizzes = () => {
    setCurrentView('quizzes');
    fetchCourseQuizzes(selectedCourse.id);
  };

  const handleViewMaterials = () => {
    setCurrentView('materials');
    fetchCourseMaterials(selectedCourse.id);
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

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('course', selectedCourse.id);
      formData.append('title', materialFormData.title);
      formData.append('material_type', materialFormData.material_type);
      formData.append('file', selectedFile);
      await curriculumService.uploadMaterial(formData);
      setShowMaterialForm(false);
      setMaterialFormData({ title: '', material_type: 'lecture' });
      setSelectedFile(null);
      fetchCourseMaterials(selectedCourse.id);
    } catch (error) {
      console.error('Failed to upload material:', error);
      alert('Failed to upload material. Please try again.');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await curriculumService.deleteMaterial(materialId);
        fetchCourseMaterials(selectedCourse.id);
      } catch (error) {
        console.error('Failed to delete material:', error);
        alert('Failed to delete material. Please try again.');
      }
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        student.first_name?.toLowerCase().includes(term.toLowerCase()) ||
        student.last_name?.toLowerCase().includes(term.toLowerCase()) ||
        student.username?.toLowerCase().includes(term.toLowerCase()) ||
        student.user_id?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setCurrentView(null);
    setStudents([]);
    setFilteredStudents([]);
    setSearchTerm('');
    setGrades([]);
    setEditingGrade(null);
    setAssignments([]);
    setShowAssignmentForm(false);
    setAssignmentFormData({
      title: '',
      description: '',
      assignment_type: 'assignment',
      due_date: '',
      instructions: ''
    });
  };

  const handleBackToCourseMenu = () => {
    setCurrentView(null);
    setStudents([]);
    setFilteredStudents([]);
    setSearchTerm('');
    setGrades([]);
    setEditingGrade(null);
    setAssignments([]);
    setShowAssignmentForm(false);
    setIsEditingAssignment(false);
    setSelectedAssignment(null);
    setAssignmentFormData({
      title: '',
      description: '',
      due_date: '',
      instructions: ''
    });
    setQuizzes([]);
    setShowQuizForm(false);
    setQuizFormData({
      title: '',
      description: '',
      questions: []
    });
    setSelectedQuiz(null);
    setQuestions([]);
    setShowQuestionForm(false);
    setQuestionFormData({
      question_text: '',
      question_type: 'mcq',
      options: [],
      correct_answer: '',
      order: 0,
    });
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAssignmentFile) {
        // Use FormData when file is selected
        const formData = new FormData();
        formData.append('course', selectedCourse.id);
        formData.append('title', assignmentFormData.title);
        formData.append('description', assignmentFormData.description);
        formData.append('assignment_type', 'assignment');
        formData.append('due_date', new Date(assignmentFormData.due_date).toISOString());
        formData.append('instructions', assignmentFormData.instructions);
        formData.append('attachment', selectedAssignmentFile);

        if (isEditingAssignment) {
          await curriculumService.updateAssignment(selectedAssignment.id, formData);
        } else {
          await curriculumService.createAssignment(formData);
        }
      } else {
        // Use JSON when no file is selected
        const assignmentData = {
          ...assignmentFormData,
          assignment_type: 'assignment',
          course: selectedCourse.id,
          due_date: new Date(assignmentFormData.due_date).toISOString()
        };

        if (isEditingAssignment) {
          await curriculumService.updateAssignment(selectedAssignment.id, assignmentData);
        } else {
          await curriculumService.createAssignment(assignmentData);
        }
      }

      setShowAssignmentForm(false);
      setIsEditingAssignment(false);
      setSelectedAssignment(null);
      setSelectedAssignmentFile(null);
      setAssignmentFormData({
        title: '',
        description: '',
        due_date: '',
        instructions: ''
      });
      fetchCourseAssignments(selectedCourse.id);
    } catch (error) {
      console.error('Failed to save assignment:', error);
      alert('Failed to save assignment. Please try again.');
    }
  };

  const handleEditAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setIsEditingAssignment(true);
    setAssignmentFormData({
      title: assignment.title,
      description: assignment.description,
      due_date: new Date(assignment.due_date).toISOString().slice(0, 16), // Format for datetime-local
      instructions: assignment.instructions || ''
    });
    setShowAssignmentForm(true);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await curriculumService.deleteAssignment(assignmentId);
        fetchCourseAssignments(selectedCourse.id);
      } catch (error) {
        console.error('Failed to delete assignment:', error);
        alert('Failed to delete assignment. Please try again.');
      }
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Update quiz
        await curriculumService.updateQuiz(selectedQuiz.id, {
          title: quizFormData.title,
          description: quizFormData.description,
          due_date: quizFormData.due_date
        });

        // Delete existing questions
        const existingQuestions = await curriculumService.getQuizQuestions(selectedQuiz.id);
        for (const q of existingQuestions.data) {
          await curriculumService.deleteQuestion(q.id);
        }

        // Create new questions
        for (const question of quizFormData.questions) {
          await curriculumService.createQuestion({
            quiz: selectedQuiz.id,
            question_text: question.question_text,
            question_type: question.question_type,
            options: question.question_type === 'mcq' ? question.options.filter(opt => opt.trim()) : null,
            correct_answer: question.correct_answer.trim(),
            order: question.order
          });
        }
      } else {
        // Create quiz
        const quizData = {
          title: quizFormData.title,
          description: quizFormData.description,
          due_date: quizFormData.due_date,
          course: selectedCourse.id
        };
        const quizResponse = await curriculumService.createQuiz(quizData);
        const quizId = quizResponse.data.id;

        for (const question of quizFormData.questions) {
          await curriculumService.createQuestion({
            quiz: quizId,
            question_text: question.question_text,
            question_type: question.question_type,
            options: question.question_type === 'mcq' ? question.options.filter(opt => opt.trim()) : null,
            correct_answer: question.correct_answer.trim(),
            order: question.order
          });
        }
      }

      setShowQuizForm(false);
      setIsEditing(false);
      setQuizFormData({
        title: '',
        description: '',
        due_date: '',
        questions: []
      });
      setSelectedQuiz(null);
      fetchCourseQuizzes(selectedCourse.id);
    } catch (error) {
      console.error('Failed to save quiz:', error);
      alert('Failed to save quiz. Please try again.');
    }
  };

  const handleEditQuiz = async (quiz) => {
    setSelectedQuiz(quiz);
    setIsEditing(true);
    try {
      const questionsResponse = await curriculumService.getQuizQuestions(quiz.id);
      const questions = questionsResponse.data.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || [],
        correct_answer: q.correct_answer,
        order: q.order
      }));
      setQuizFormData({
        title: quiz.title,
        description: quiz.description,
        due_date: new Date(quiz.due_date).toISOString().slice(0, 16),
        questions: questions
      });
      setShowQuizForm(true);
    } catch (error) {
      console.error('Failed to fetch quiz questions:', error);
      alert('Failed to load quiz for editing.');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await curriculumService.deleteQuiz(quizId);
        fetchCourseQuizzes(selectedCourse.id);
      } catch (error) {
        console.error('Failed to delete quiz:', error);
        alert('Failed to delete quiz. Please try again.');
      }
    }
  };

  const handleGradeClick = (studentId, gradeType) => {
    const grade = getStudentGrade(studentId);
    setEditingGrade({ studentId, gradeType });
    setGradeValue(grade[gradeType] || '');
  };

  const handleGradeSave = async () => {
    if (!editingGrade) return;
    
    try {
      const value = gradeValue === '' ? null : gradeValue;
      const gradeData = { [editingGrade.gradeType]: value };
      await curriculumService.updateGrade(selectedCourse.id, {
        student: editingGrade.studentId,
        ...gradeData
      });
      
      try {
        const response = await curriculumService.getCourseGrades(selectedCourse.id);
        setGrades(response.data);
      } catch (gradesError) {
        console.log('Could not refresh grades');
      }
      
      setEditingGrade(null);
      setGradeValue('');
    } catch (error) {
      console.error('Failed to update grade:', error);
      alert('Failed to save grade. Please try again.');
    }
  };

  const getStudentGrade = (studentId) => {
    return grades.find(grade => grade.student === studentId) || {};
  };

  if (loading) return <div className="loading">Loading your courses...</div>;

  if (selectedCourse && currentView === 'students') {
    return (
      <div className="my-courses-container">
        <div className="course-header">
          <button onClick={handleBackToCourseMenu} className="back-button">← Back to Course Menu</button>
          <h2>{selectedCourse.code} - {selectedCourse.name} - Students</h2>
        </div>
        
        <div className="students-section">
          <div className="students-header">
            <h3>Enrolled Students</h3>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          {studentsLoading ? (
            <div className="loading">Loading students...</div>
          ) : (
            <div className="students-list">
              {filteredStudents.length === 0 ? (
                <p>No students found.</p>
              ) : (
                filteredStudents.map(student => {
                  const grade = getStudentGrade(student.id);
                  return (
                    <div key={student.id} className="student-item">
                      <div className="student-info">
                        <h4>{student.first_name} {student.last_name}</h4>
                        <p>ID: {student.user_id}</p>
                        <p>Username: {student.username}</p>
                        <p>Email: {student.email}</p>
                      </div>
                      <div className="grade-buttons">
                        <button 
                          onClick={() => handleGradeClick(student.id, 'midterm')}
                          className="grade-btn"
                        >
                          Midterm: {grade.midterm || '-'}
                        </button>
                        <button 
                          onClick={() => handleGradeClick(student.id, 'project')}
                          className="grade-btn"
                        >
                          Project: {grade.project || '-'}
                        </button>
                        <button 
                          onClick={() => handleGradeClick(student.id, 'coursework')}
                          className="grade-btn"
                        >
                          Coursework: {grade.coursework || '-'}
                        </button>
                        <button 
                          onClick={() => handleGradeClick(student.id, 'final_grade')}
                          className="grade-btn"
                        >
                          Final Grade: {grade.final_grade || '-'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
        
        {editingGrade && (
          <div className="grade-modal">
            <div className="grade-modal-content">
              <h3>Enter {editingGrade.gradeType.replace('_', ' ').toUpperCase()}</h3>
              {editingGrade.gradeType === 'final_grade' ? (
                <select 
                  value={gradeValue} 
                  onChange={(e) => setGradeValue(e.target.value)}
                  className="grade-input"
                >
                  <option value="">Select Grade</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="B-">B-</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                  <option value="C-">C-</option>
                  <option value="D+">D+</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                </select>
              ) : (
                <input 
                  type="number" 
                  value={gradeValue} 
                  onChange={(e) => setGradeValue(e.target.value)}
                  placeholder="Enter numeric grade"
                  className="grade-input"
                  min="0" 
                  max="100"
                />
              )}
              <div className="modal-actions">
                <button onClick={handleGradeSave} className="save-btn">Save</button>
                <button onClick={() => setEditingGrade(null)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (selectedCourse && currentView === 'assignments') {
    return (
      <div className="my-courses-container">
        <div className="course-header">
          <button onClick={handleBackToCourseMenu} className="back-button">← Back to Course Menu</button>
          <h2>{selectedCourse.code} - {selectedCourse.name} - Assignments</h2>
        </div>

        <div className="assignments-section">
          <div className="assignments-header">
            <h3>Course Assignments</h3>
            <button
              onClick={() => setShowAssignmentForm(true)}
              className="create-assignment-btn"
            >
              + Create Assignment
            </button>
          </div>

          {assignmentsLoading ? (
            <div className="loading">Loading assignments...</div>
          ) : (
            <div className="assignments-list">
              {assignments.length === 0 ? (
                <p>No assignments found for this course.</p>
              ) : (
                assignments.map(assignment => (
                  <div key={assignment.id} className="assignment-item">
                    <div className="assignment-info">
                      <h4>{assignment.title}</h4>
                      <p className="description">{assignment.description}</p>
                      <div className="assignment-meta">
                        <span className="due-date">
                          Due: {new Date(assignment.due_date).toLocaleString()}
                        </span>
                        <span className={`time-remaining ${assignment.is_overdue ? 'overdue' : ''}`}>
                          ({assignment.time_remaining})
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
                    </div>
                    <div className="assignment-actions">
                      <button onClick={() => navigate(`/staff/assignments/${assignment.id}/submissions`)} className="view-submissions-btn">View Submissions</button>
                      <button onClick={() => handleEditAssignment(assignment)} className="edit-btn">Edit</button>
                      <button onClick={() => handleDeleteAssignment(assignment.id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {showAssignmentForm && (
          <div className="assignment-form-modal">
            <div className="assignment-form-content">
              <h3>{isEditingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h3>
              <form onSubmit={handleAssignmentSubmit}>
                <div className="form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    value={assignmentFormData.title}
                    onChange={(e) => setAssignmentFormData({...assignmentFormData, title: e.target.value})}
                    required
                  />
                </div>


                <div className="form-group">
                  <label>Due Date:</label>
                  <input
                    type="datetime-local"
                    value={assignmentFormData.due_date}
                    onChange={(e) => setAssignmentFormData({...assignmentFormData, due_date: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={assignmentFormData.description}
                    onChange={(e) => setAssignmentFormData({...assignmentFormData, description: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Instructions:</label>
                  <textarea
                    value={assignmentFormData.instructions}
                    onChange={(e) => setAssignmentFormData({...assignmentFormData, instructions: e.target.value})}
                    placeholder="Additional instructions for students..."
                  />
                </div>

                <div className="form-group">
                  <label>Attachment (optional):</label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedAssignmentFile(e.target.files[0])}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  {selectedAssignmentFile && (
                    <small>Selected: {selectedAssignmentFile.name}</small>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn">{isEditingAssignment ? 'Update Assignment' : 'Create Assignment'}</button>
                  <button type="button" className="cancel-btn" onClick={() => { setShowAssignmentForm(false); setIsEditingAssignment(false); setSelectedAssignment(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
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
          <div className="quizzes-header">
            <h3>Course Quizzes</h3>
            <button
              onClick={() => setShowQuizForm(true)}
              className="create-quiz-btn"
            >
              + Create Quiz
            </button>
          </div>

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
                    </div>
                    <div className="quiz-actions">
                      <button onClick={() => navigate(`/staff/quizzes/${quiz.id}/submissions`)} className="view-submissions-btn">View Submissions</button>
                      <button onClick={() => handleEditQuiz(quiz)} className="edit-btn">Edit</button>
                      <button onClick={() => handleDeleteQuiz(quiz.id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {showQuizForm && (
          <div className="quiz-form-modal">
            <div className="quiz-form-content">
              <h3>{isEditing ? 'Edit Quiz' : 'Create New Quiz'}</h3>
              <form onSubmit={handleQuizSubmit}>
                <div className="form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    value={quizFormData.title}
                    onChange={(e) => setQuizFormData({...quizFormData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={quizFormData.description}
                    onChange={(e) => setQuizFormData({...quizFormData, description: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Due Date:</label>
                  <input
                    type="datetime-local"
                    value={quizFormData.due_date}
                    onChange={(e) => setQuizFormData({...quizFormData, due_date: e.target.value})}
                    required
                  />
                </div>

                <div className="questions-section">
                  <h4>Questions</h4>
                  {quizFormData.questions.map((question, index) => (
                    <div key={index} className="question-item">
                      <div className="form-group">
                        <label>Question {index + 1}:</label>
                        <textarea
                          value={question.question_text}
                          onChange={(e) => {
                            const newQuestions = [...quizFormData.questions];
                            newQuestions[index].question_text = e.target.value;
                            setQuizFormData({...quizFormData, questions: newQuestions});
                          }}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Type:</label>
                        <select
                          value={question.question_type}
                          onChange={(e) => {
                            const newQuestions = [...quizFormData.questions];
                            newQuestions[index].question_type = e.target.value;
                            setQuizFormData({...quizFormData, questions: newQuestions});
                          }}
                        >
                          <option value="mcq">Multiple Choice</option>
                          <option value="text">Text Answer</option>
                        </select>
                      </div>

                      {question.question_type === 'mcq' && (
                        <div className="form-group">
                          <label>Options (one per line):</label>
                          <textarea
                            value={question.options.join('\n')}
                            onChange={(e) => {
                              const newQuestions = [...quizFormData.questions];
                              newQuestions[index].options = e.target.value.split('\n');
                              setQuizFormData({...quizFormData, questions: newQuestions});
                            }}
                            placeholder="Option 1\nOption 2\nOption 3\nOption 4"
                          />
                          <label>Correct Answer:</label>
                          <input
                            type="text"
                            value={question.correct_answer}
                            onChange={(e) => {
                              const newQuestions = [...quizFormData.questions];
                              newQuestions[index].correct_answer = e.target.value;
                              setQuizFormData({...quizFormData, questions: newQuestions});
                            }}
                            placeholder="Enter the correct option"
                          />
                        </div>
                      )}

                      <button type="button" onClick={() => {
                        const newQuestions = quizFormData.questions.filter((_, i) => i !== index);
                        setQuizFormData({...quizFormData, questions: newQuestions});
                      }}>Remove Question</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => {
                    setQuizFormData({
                      ...quizFormData,
                      questions: [...quizFormData.questions, {
                        question_text: '',
                        question_type: 'mcq',
                        options: ['', '', '', ''],
                        correct_answer: '',
                        order: quizFormData.questions.length
                      }]
                    });
                  }}>Add Question</button>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn">{isEditing ? 'Update Quiz' : 'Create Quiz'}</button>
                  <button type="button" className="cancel-btn" onClick={() => { setShowQuizForm(false); setIsEditing(false); setSelectedQuiz(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
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
          <div className="materials-header">
            <h3>Course Materials</h3>
            <button onClick={() => setShowMaterialForm(true)} className="create-material-btn">+ Upload Material</button>
          </div>

          {materialsLoading ? (
            <div className="loading">Loading materials...</div>
          ) : (
            <div className="materials-list">
              {materials.length === 0 ? (
                <p>No materials uploaded yet.</p>
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
                          <div>
                            <a href={material.file_url} target="_blank" rel="noopener noreferrer" className="download-btn">Download</a>
                            <button onClick={() => handleDeleteMaterial(material.id)} className="delete-btn">Delete</button>
                          </div>
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
                          <div>
                            <a href={material.file_url} target="_blank" rel="noopener noreferrer" className="download-btn">Download</a>
                            <button onClick={() => handleDeleteMaterial(material.id)} className="delete-btn">Delete</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {showMaterialForm && (
          <div className="material-form-modal">
            <div className="material-form-content">
              <h3>Upload Course Material</h3>
              <form onSubmit={handleMaterialSubmit}>
                <div className="form-group">
                  <label>Title:</label>
                  <input type="text" value={materialFormData.title} onChange={(e) => setMaterialFormData({...materialFormData, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Type:</label>
                  <select value={materialFormData.material_type} onChange={(e) => setMaterialFormData({...materialFormData, material_type: e.target.value})}>
                    <option value="lecture">Lecture</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>File:</label>
                  <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} required />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn">Upload</button>
                  <button type="button" className="cancel-btn" onClick={() => { setShowMaterialForm(false); setSelectedFile(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
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
            <button onClick={handleViewStudents} className="action-button students-btn">
              <span className="icon">👥</span>
              <div>
                <h3>View Students</h3>
                <p>Manage enrolled students and grades</p>
              </div>
            </button>
            
            <button onClick={handleViewAssignments} className="action-button assignments-btn">
              <span className="icon">📝</span>
              <div>
                <h3>View Assignments</h3>
                <p>View and manage course assignments</p>
              </div>
            </button>

            <button onClick={handleViewQuizzes} className="action-button quizzes-btn">
              <span className="icon">🧠</span>
              <div>
                <h3>View Quizzes</h3>
                <p>View and manage course quizzes</p>
              </div>
            </button>

            <button onClick={handleViewMaterials} className="action-button materials-btn">
              <span className="icon">📚</span>
              <div>
                <h3>Course Materials</h3>
                <p>Upload and manage course materials</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-courses-container">
      <h2>My Courses</h2>
      
      {courses.length === 0 ? (
        <div className="no-courses">
          <p>You are not assigned to any courses yet.</p>
        </div>
      ) : (
        <div className="courses-list">
          {courses.map(course => (
            <div key={course.id} className="course-item" onClick={() => handleCourseClick(course)}>
              <div className="course-main">
                <div className="course-info">
                  <h3>{course.code} - {course.name}</h3>
                  <p className="description">{course.description}</p>
                  <div className="course-meta">
                    <span className={`type-badge ${course.course_type}`}>
                      {course.course_type}
                    </span>
                    <span>{course.department_name}</span>
                    <span>{course.credits} Credits</span>
                    {course.has_lab && <span className="lab">Lab</span>}
                  </div>
                </div>
                <div className="course-status">
                  <div className={`status ${course.is_active ? 'active' : 'inactive'}`}>
                    {course.is_active ? 'Active' : 'Inactive'}
                  </div>
                  <div className={`registration ${course.registration_open ? 'open' : 'closed'}`}>
                    Registration: {course.registration_open ? 'Open' : 'Closed'}
                  </div>
                </div>
              </div>
              {course.instructor_names?.length > 1 && (
                <div className="co-instructors">
                  <strong>Co-instructors:</strong> {course.instructor_names.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;