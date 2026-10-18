import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { curriculumService } from '../../api/curriculumService';
import './AttendanceManagement.css';

const AttendanceManagement = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadStudents();
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const response = await curriculumService.getCourses();
      // Filter courses where current user is an instructor
      const myCourses = response.data.filter(course => 
        course.instructors.some(instructor => instructor === user.id)
      );
      setCourses(myCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await curriculumService.getCourseStudents(selectedCourse);
      setStudents(response.data);
      
      // Initialize attendance records
      const initialRecords = {};
      response.data.forEach(student => {
        initialRecords[student.id] = {
          status: 'present',
          notes: ''
        };
      });
      setAttendanceRecords(initialRecords);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleNotesChange = (studentId, notes) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const submitAttendance = async () => {
    if (!selectedCourse || !attendanceDate) {
      setMessage('Please select a course and date');
      return;
    }

    setLoading(true);
    try {
      const promises = students.map(student => {
        const record = attendanceRecords[student.id];
        return curriculumService.createAttendance({
          course: selectedCourse,
          student: student.id,
          date: attendanceDate,
          status: record.status,
          notes: record.notes
        });
      });

      await Promise.all(promises);
      setMessage('Attendance recorded successfully!');
      
      // Reset form
      setAttendanceRecords({});
      setSelectedCourse('');
      setStudents([]);
    } catch (error) {
      console.error('Error submitting attendance:', error);
      if (error.response?.data?.errors?.date) {
        setMessage(error.response.data.errors.date[0]);
      } else {
        setMessage('Error recording attendance. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-management-container">
      <h2>Record Attendance</h2>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="course">Select Course:</label>
          <select
            id="course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- Select Course --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {students.length > 0 && (
        <div className="students-section">
          <h3>Mark Attendance for {courses.find(c => c.id == selectedCourse)?.name}</h3>
          
          <div className="students-list">
            {students.map(student => (
              <div key={student.id} className="student-row">
                <div className="student-info">
                  <span className="student-name">
                    {student.first_name} {student.last_name}
                  </span>
                  <span className="student-id">({student.user_id})</span>
                </div>

                <div className="attendance-controls">
                  <div className="status-buttons">
                    {['present', 'absent', 'late'].map(status => (
                      <button
                        key={status}
                        className={`status-btn ${attendanceRecords[student.id]?.status === status ? 'active' : ''} ${status}`}
                        onClick={() => handleStatusChange(student.id, status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={attendanceRecords[student.id]?.notes || ''}
                    onChange={(e) => handleNotesChange(student.id, e.target.value)}
                    className="notes-input"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="submit-section">
            <button
              onClick={submitAttendance}
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Recording...' : 'Record Attendance'}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;