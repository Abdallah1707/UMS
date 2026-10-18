import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { curriculumService } from '../../api/curriculumService';
import './Attendance.css';

const Attendance = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await curriculumService.getChildAttendance();
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error loading attendance:', error);
      setError(error.response?.data?.errors?.detail?.[0] || 'Failed to load attendance data');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="attendance-container">
        <div className="loading">Loading attendance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attendance-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!attendanceData || Object.keys(attendanceData.attendance_by_course).length === 0) {
    return (
      <div className="attendance-container">
        <h2>Attendance Records</h2>
        <div className="no-data">No attendance records found for your child.</div>
      </div>
    );
  }

  return (
    <div className="attendance-container">
      <h2>Attendance Records</h2>
      <div className="child-info">
        <h3>{attendanceData.child_name} ({attendanceData.child_id})</h3>
      </div>

      <div className="courses-grid">
        {Object.entries(attendanceData.attendance_by_course).map(([courseCode, courseData]) => (
          <div key={courseCode} className="course-card">
            <div className="course-header">
              <h4>{courseData.course_name}</h4>
              <span className="course-code">{courseData.course_code}</span>
            </div>

            <div className="attendance-summary">
              <div className="summary-stats">
                <div className="stat">
                  <span className="stat-label">Total Classes:</span>
                  <span className="stat-value">{courseData.summary.total}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Present:</span>
                  <span className="stat-value present">{courseData.summary.present}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Absent:</span>
                  <span className="stat-value absent">{courseData.summary.absent}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Late:</span>
                  <span className="stat-value late">{courseData.summary.late}</span>
                </div>
              </div>
              
              <div className="attendance-percentage">
                <div className="percentage-circle">
                  <span className="percentage-text">
                    {courseData.summary.attendance_percentage}%
                  </span>
                </div>
                <span className="percentage-label">Attendance Rate</span>
              </div>
            </div>

            <div className="attendance-records">
              <h5>Recent Records</h5>
              <div className="records-list">
                {courseData.records.slice(0, 5).map((record, index) => (
                  <div key={index} className="record-item">
                    <div className="record-date">{formatDate(record.date)}</div>
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
              
              {courseData.records.length > 5 && (
                <div className="more-records">
                  +{courseData.records.length - 5} more records
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Attendance;