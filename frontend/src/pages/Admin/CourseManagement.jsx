import React, { useState, useEffect } from 'react';
import { curriculumService } from '../../api/curriculumService';
import { coreService } from '../../api/coreService';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    course_type: 'core',
    department: '',
    credits: 3,
    prerequisites: '',
    duration_weeks: '',
    has_lab: false,
    max_students: '',
    is_active: true,
    registration_open: false,
    instructors: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchInstructors();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await curriculumService.getCourses();
      setCourses(response.data.results || response.data || []);
    } catch (error) {
      setError('Failed to fetch courses');
      setCourses([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await coreService.getDepartments();
      console.log('Departments response:', response);
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setError('Failed to fetch departments');
      setDepartments([]);
    }
  };

  const fetchInstructors = async () => {
    try {
      const [profs, tas] = await Promise.all([
        coreService.getUsers('professor'),
        coreService.getUsers('ta')
      ]);
      setInstructors([...(profs || []), ...(tas || [])]);
    } catch (error) {
      console.error('Failed to fetch instructors');
      setInstructors([]);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : null,
        max_students: formData.max_students ? parseInt(formData.max_students) : null,
        prerequisites: formData.prerequisites || null,
      };

      if (editingCourse) {
        await curriculumService.updateCourse(editingCourse.id, submitData);
      } else {
        await curriculumService.createCourse(submitData);
      }
      
      fetchCourses();
      resetForm();
      setShowForm(false);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 
                       JSON.stringify(error.response?.data) || 
                       'Failed to save course';
      setError(errorMsg);
      console.error('Error saving course:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      description: course.description,
      course_type: course.course_type,
      department: course.department,
      credits: course.credits,
      prerequisites: course.prerequisites || '',
      duration_weeks: course.duration_weeks || '',
      has_lab: course.has_lab,
      max_students: course.max_students || '',
      is_active: course.is_active,
      registration_open: course.registration_open,
      instructors: course.instructors || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await curriculumService.deleteCourse(id);
        fetchCourses();
      } catch (error) {
        setError('Failed to delete course');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      course_type: 'core',
      department: '',
      credits: 3,
      prerequisites: '',
      duration_weeks: '',
      has_lab: false,
      max_students: '',
      is_active: true,
      registration_open: false,
      instructors: [],
    });
    setEditingCourse(null);
  };



  return (
    <div className="course-management">
      <div className="header">
        <h2>Course Management</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          Add Course
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingCourse ? 'Edit Course' : 'Add Course'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Course Code:</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Course Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Course Type:</label>
                <select
                  value={formData.course_type}
                  onChange={(e) => setFormData({...formData, course_type: e.target.value})}
                >
                  <option value="core">Core Subject</option>
                  <option value="elective">Elective Subject</option>
                </select>
              </div>

              <div className="form-group">
                <label>Department:</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  required
                >
                  <option value="">Select Department</option>
                  {(departments || []).map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Credits:</label>
                <input
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                  min="1"
                  max="10"
                />
              </div>

              <div className="form-group">
                <label>Prerequisites:</label>
                <textarea
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({...formData, prerequisites: e.target.value})}
                  placeholder="Enter course prerequisites"
                />
              </div>

              <div className="form-group">
                <label>Duration (Weeks):</label>
                <input
                  type="number"
                  value={formData.duration_weeks}
                  onChange={(e) => setFormData({...formData, duration_weeks: e.target.value})}
                  min="1"
                  placeholder="Course duration in weeks"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.has_lab}
                    onChange={(e) => setFormData({...formData, has_lab: e.target.checked})}
                  />
                  {' '}Has Laboratory
                </label>
              </div>

              <div className="form-group">
                <label>Max Students:</label>
                <input
                  type="number"
                  value={formData.max_students}
                  onChange={(e) => setFormData({...formData, max_students: e.target.value})}
                  min="1"
                  placeholder="Maximum number of students"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.registration_open}
                    onChange={(e) => setFormData({...formData, registration_open: e.target.checked})}
                  />
                  {' '}Open for Registration
                </label>
              </div>

              <div className="form-group">
                <label>Instructors:</label>
                <select
                  multiple
                  value={formData.instructors}
                  onChange={(e) => setFormData({...formData, instructors: Array.from(e.target.selectedOptions, option => parseInt(option.value))})}
                  style={{minHeight: '100px'}}
                >
                  {(instructors || []).map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.first_name} {instructor.last_name} ({instructor.user_type})
                    </option>
                  ))}
                </select>
                <small>Hold Ctrl/Cmd to select multiple</small>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => {setShowForm(false); resetForm();}}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="courses-table">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Department</th>
              <th>Credits</th>
              <th>Status</th>
              <th>Registration</th>
              <th>Instructors</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(courses || []).map(course => (
              <tr key={course.id}>
                <td>{course.code}</td>
                <td>{course.name}</td>
                <td>{course.course_type}</td>
                <td>{course.department_name}</td>
                <td>{course.credits}</td>
                <td>{course.is_active ? 'Active' : 'Inactive'}</td>
                <td>{course.registration_open ? 'Open' : 'Closed'}</td>
                <td>{course.instructor_names?.join(', ') || 'None'}</td>
                <td>
                  <button onClick={() => handleEdit(course)}>Edit</button>
                  <button onClick={() => handleDelete(course.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseManagement;