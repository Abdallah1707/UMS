import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { curriculumService } from '../../api/curriculumService';
import './AssignmentManagement.css';

const AssignmentManagement = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    course: '',
    title: '',
    description: '',
    assignment_type: 'assignment',
    due_date: '',
    instructions: '',
    attachment: null
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await curriculumService.getAssignments();
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await curriculumService.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAssignment) {
        if (selectedFile) {
          // Use FormData when updating with a new file
          const updateData = new FormData();
          updateData.append('title', formData.title);
          updateData.append('description', formData.description);
          updateData.append('assignment_type', formData.assignment_type);
          updateData.append('due_date', new Date(formData.due_date).toISOString());
          updateData.append('instructions', formData.instructions);
          updateData.append('attachment', selectedFile);
          await curriculumService.updateAssignment(editingAssignment.id, updateData);
        } else {
          // Use JSON when no new file is selected
          const updateData = {
            title: formData.title,
            description: formData.description,
            assignment_type: formData.assignment_type,
            due_date: new Date(formData.due_date).toISOString(),
            instructions: formData.instructions
          };
          await curriculumService.updateAssignment(editingAssignment.id, updateData);
        }
      } else {
        if (selectedFile) {
          const submitData = new FormData();
          submitData.append('course', formData.course);
          submitData.append('title', formData.title);
          submitData.append('description', formData.description);
          submitData.append('assignment_type', formData.assignment_type);
          submitData.append('due_date', new Date(formData.due_date).toISOString());
          submitData.append('instructions', formData.instructions);
          submitData.append('attachment', selectedFile);
          await curriculumService.createAssignment(submitData);
        } else {
          const createData = {
            course: formData.course,
            title: formData.title,
            description: formData.description,
            assignment_type: formData.assignment_type,
            due_date: new Date(formData.due_date).toISOString(),
            instructions: formData.instructions
          };
          await curriculumService.createAssignment(createData);
        }
      }
      
      fetchAssignments();
      resetForm();
    } catch (error) {
      console.error('Error saving assignment:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      course: assignment.course,
      title: assignment.title,
      description: assignment.description,
      assignment_type: assignment.assignment_type,
      due_date: assignment.due_date.slice(0, 16), // Format for datetime-local input
      instructions: assignment.instructions,
      attachment: null
    });
    setSelectedFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await curriculumService.deleteAssignment(id);
        fetchAssignments();
      } catch (error) {
        console.error('Error deleting assignment:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      course: '',
      title: '',
      description: '',
      assignment_type: 'assignment',
      due_date: '',
      instructions: '',
      attachment: null
    });
    setSelectedFile(null);
    setEditingAssignment(null);
    setShowForm(false);
  };

  return (
    <div className="assignment-management">
      <div className="header">
        <div className="header-left">
          <button 
            className="btn-back" 
            onClick={() => navigate('/staff/dashboard')}
          >
            ← Back to Dashboard
          </button>
          <h2>Assignment Management</h2>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(true)}
        >
          Create
        </button>
      </div>

      {showForm && (
        <div className="assignment-form">
          <h3>{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Course:</label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Type:</label>
              <select
                value={formData.assignment_type}
                onChange={(e) => setFormData({...formData, assignment_type: e.target.value})}
              >
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
              </select>
            </div>

            <div className="form-group">
              <label>Due Date:</label>
              <input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Instructions:</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                placeholder="Additional instructions for students..."
              />
            </div>

            <div className="form-group">
              <label>Attachment (PDF - Optional):</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              {selectedFile && <p className="file-info">Selected: {selectedFile.name}</p>}
              {editingAssignment && editingAssignment.attachment && (
                <p className="current-file">Current: <a href={editingAssignment.attachment} target="_blank" rel="noopener noreferrer">View attachment</a></p>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingAssignment ? 'Update' : 'Create'} Assignment
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="assignments-list">
        <h3>My Assignments</h3>
        {assignments.length === 0 ? (
          <p>No assignments created yet.</p>
        ) : (
          <div className="assignments-grid">
            {assignments.map(assignment => (
              <div key={assignment.id} className={`assignment-card ${assignment.assignment_type}`}>
                <div className="assignment-header">
                  <h4>{assignment.title}</h4>
                  <span className={`type-badge ${assignment.assignment_type}`}>
                    {assignment.assignment_type.toUpperCase()}
                  </span>
                </div>
                <p className="course-info">{assignment.course_code} - {assignment.course_name}</p>
                <p className="description">{assignment.description}</p>
                <div className="due-date">
                  <strong>Due: </strong>
                  {new Date(assignment.due_date).toLocaleString()}
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
                <div className="assignment-actions">
                  <button 
                    className="btn-submissions" 
                    onClick={() => navigate(`/staff/assignments/${assignment.id}/submissions`)}
                  >
                    View Submissions
                  </button>
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEdit(assignment)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(assignment.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentManagement;