import React, { useState, useEffect } from 'react';
import { curriculumService } from '../../api/curriculumService';
import './CourseList.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchMyRegistrations();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await curriculumService.getCourses({ registration_open: true });
      setCourses(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const response = await curriculumService.getMyRegistrations();
      setMyRegistrations(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch registrations');
    }
  };

  const handleToggleRegistration = async (courseId) => {
    const registration = myRegistrations.find(reg => reg.course === courseId);
    
    try {
      if (registration) {
        await curriculumService.unregisterCourse(registration.id);
        setMessage('Successfully unregistered from course!');
      } else {
        await curriculumService.registerCourse(courseId);
        setMessage('Successfully registered for course!');
      }
      fetchCourses();
      fetchMyRegistrations();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Operation failed');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const isRegistered = (courseId) => {
    return myRegistrations.some(reg => reg.course === courseId);
  };

  const filteredCourses = courses
    .filter(c => filter === 'all' || c.course_type === filter)
    .filter(c => 
      searchTerm === '' ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) return <div className="loading">Loading courses...</div>;

  return (
    <div className="course-list-container">
      <h2>Available Courses</h2>
      {message && <div className="message">{message}</div>}
      
      <input
        type="text"
        placeholder="Search courses by code, name, or description..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      
      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All Courses
        </button>
        <button 
          className={filter === 'core' ? 'active' : ''} 
          onClick={() => setFilter('core')}
        >
          Core Subjects
        </button>
        <button 
          className={filter === 'elective' ? 'active' : ''} 
          onClick={() => setFilter('elective')}
        >
          Electives
        </button>
      </div>

      <div className="courses-grid">
        {filteredCourses.map(course => (
          <div key={course.id} className="course-card">
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
              {course.prerequisites && (
                <div><strong>Prerequisites:</strong> {course.prerequisites}</div>
              )}
              {course.instructor_names?.length > 0 && (
                <div><strong>Instructors:</strong> {course.instructor_names.join(', ')}</div>
              )}
              {course.max_students && (
                <div><strong>Capacity:</strong> {course.enrolled_count}/{course.max_students}</div>
              )}
            </div>
            <button
              onClick={() => handleToggleRegistration(course.id)}
              disabled={!isRegistered(course.id) && course.is_full}
              className={`register-btn ${isRegistered(course.id) ? 'registered' : ''} ${!isRegistered(course.id) && course.is_full ? 'full' : ''}`}
            >
              {isRegistered(course.id) ? 'Unregister' : course.is_full ? 'Full' : 'Register'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;
