import React, { useState, useEffect } from 'react';
import { curriculumService } from '../../api/curriculumService';
import './StudentAttendance.css';

const StudentAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const response = await curriculumService.getAttendance();
      
      // Group by course
      const groupedData = response.data.reduce((acc, record) => {
        const courseCode = record.course_code;
        if (!acc[courseCode]) {
          acc[courseCode] = {
            course_name: record.course_name,
            course_code: courseCode,
            records: [],
            summary: { present: 0, absent: 0, late: 0, total: 0 }
          };
        }
        
        acc[courseCode].records.push(record);
        acc[courseCode].summary[record.status]++;
        acc[courseCode].summary.total++;
        
        return acc;
      }, {});

      // Calculate percentages
      Object.values(groupedData).forEach(course => {
        const { present, total } = course.summary;
        course.summary.attendance_percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      });

      setAttendanceData(Object.values(groupedData));
    } catch (error) {
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return '#4CAF50';
      case 'absent': return '#f44336';
      case 'late': return '#ff9800';
      default: return '#757575';
    }
  };

  if (loading) return <div className="loading">Loading attendance...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (attendanceData.length === 0) return <div className="no-data">No attendance records found.</div>;

  return (
    <div className="student-attendance-container">
      <h2>My Attendance</h2>
      
      <div className="courses-grid">
        {attendanceData.map((course) => (
          <div key={course.course_code} className="course-card">
            <div className="course-header">
              <h4>{course.course_name}</h4>
              <span className="course-code">{course.course_code}</span>
            </div>

            <div className="attendance-summary">
              <div className="summary-stats">
                <div className="stat">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{course.summary.total}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Present:</span>
                  <span className="stat-value present">{course.summary.present}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Absent:</span>
                  <span className="stat-value absent">{course.summary.absent}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Late:</span>
                  <span className="stat-value late">{course.summary.late}</span>
                </div>
              </div>
              
              <div className="attendance-percentage">
                <div className="percentage-circle">
                  <span className="percentage-text">{course.summary.attendance_percentage}%</span>
                </div>
              </div>
            </div>

            <div className="attendance-records">
              <h5>Recent Records</h5>
              <div className="records-list">
                {course.records.slice(0, 5).map((record, index) => (
                  <div key={index} className="record-item">
                    <div className="record-date">
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                    <div 
                      className="record-status"
                      style={{ color: getStatusColor(record.status) }}
                    >
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </div>
                    {record.notes && (
                      <div className="record-notes">{record.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAttendance;