import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { curriculumService } from '../../api/curriculumService';

import { FaEnvelope } from 'react-icons/fa';
import MyCourses from "./MyCourses";
import AnnouncementsAndEvents from "../../components/AnnouncementsAndEvents";
import Messaging from './Messaging';
import LeaveRequest from './LeaveRequest';
import "./StaffDashboard.css";

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeView, setActiveView] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam) {
      setActiveView(viewParam);
    } else {
      setActiveView('overview');
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeView === 'schedule') {
      fetchCoursesAndSchedules();
    }
  }, [activeView]);

  const fetchCoursesAndSchedules = async () => {
    try {
      const [coursesRes, schedulesRes] = await Promise.all([
        curriculumService.getCourses(),
        curriculumService.getSchedules()
      ]);
      const allCourses = coursesRes.data.results || coursesRes.data;
      const myCourses = allCourses.filter(course => course.instructors?.includes(user.id));
      setCourses(myCourses);
      setSchedules(schedulesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleScheduleClick = async (day, hour) => {
    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }
    try {
      await curriculumService.createSchedule({ course: selectedCourse, day, start_hour: hour });
      fetchCoursesAndSchedules();
      setSelectedCourse(null);
    } catch (error) {
      alert(error.response?.data?.errors?.detail?.[0] || 'Failed to schedule course');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await curriculumService.deleteSchedule(scheduleId);
      fetchCoursesAndSchedules();
    } catch (error) {
      alert('Failed to delete schedule');
    }
  };

  const getUserTypeDisplay = () => {
    switch (user?.user_type) {
      case "professor":
        return "Professor";
      case "ta":
        return "Teaching Assistant";
      case "admin_staff":
        return "Administrative Staff";
      default:
        return "";
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h2>{getUserTypeDisplay()} Dashboard</h2>
        <div className="nav-user">
          <span>Welcome, {user?.first_name || user?.username}</span>
          <button onClick={() => navigate('/staff/dashboard?view=messaging')} className="message-icon-btn" title="Messages">
            <FaEnvelope />
          </button>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {activeView === 'overview' && (
          <>
            <h1>Welcome, {user?.first_name}!</h1>
            <div className="dashboard-cards">
              <div className="dashboard-card" onClick={() => navigate('/staff/dashboard?view=courses')}>
                <h3>My Classes</h3>
                <p>View and manage your classes</p>
              </div>

              <div className="dashboard-card" onClick={() => navigate('/staff/report-maintenance')}>
                <h3>Report Maintenance</h3>
                <p>Report facility issues</p>
              </div>

              <div className="dashboard-card" onClick={() => navigate('/staff/dashboard?view=schedule')}>
                <h3>Schedule</h3>
                <p>View your teaching schedule</p>
              </div>

              <div className="dashboard-card" onClick={() => navigate('/staff/dashboard?view=announcements')}>
                <h3>Announcements & Events</h3>
                <p>View university announcements and events</p>
              </div>

              {(user?.user_type === "professor" || user?.user_type === "ta") && (
                <div className="dashboard-card" onClick={() => navigate("/staff/book-classroom")}>
                  <h3>Book Classroom</h3>
                  <p>Reserve classrooms for your classes</p>
                </div>
              )}

              {(user?.user_type === "professor" || user?.user_type === "ta") && (
                <div className="dashboard-card" onClick={() => navigate("/staff/performance-reviews")}>
                  <h3>My Performance Reviews</h3>
                  <p>View your performance history</p>
                </div>
              )}

              {(user?.user_type === "professor" || user?.user_type === "ta") && (
                <div className="dashboard-card" onClick={() => navigate("/staff/professional-development")}>
                  <h3>Professional Development</h3>
                  <p>Track your growth activities</p>
                </div>
              )}

              {(user?.user_type === "professor" || user?.user_type === "ta") && (
                <div className="dashboard-card" onClick={() => navigate("/staff/publications")}>
                  <h3>Research Publications</h3>
                  <p>Submit and manage publications</p>
                </div>
              )}

              {(user?.user_type === "professor" || user?.user_type === "ta") && (
                <div className="dashboard-card" onClick={() => navigate("/staff/attendance")}>
                  <h3>Attendance Management</h3>
                  <p>Record student attendance</p>
                </div>
              )}

              {(user?.user_type === "professor" || user?.user_type === "ta") && (
                <div className="dashboard-card" onClick={() => navigate('/staff/dashboard?view=leave-request')}>
                  <h3>Leave Request</h3>
                  <p>Submit and track leave requests</p>
                </div>
              )}

              {(user?.user_type === "professor" || user?.user_type === "ta") && (
                <div className="dashboard-card" onClick={() => navigate('/staff/payroll')}>
                  <h3>Payroll History</h3>
                  <p>View your payment records</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeView === 'courses' && (
          <>
            <button onClick={() => navigate('/staff/dashboard')} className="back-btn">← Back to Dashboard</button>
            <MyCourses />
          </>
        )}

        {activeView === 'announcements' && (
          <>
            <button onClick={() => navigate('/staff/dashboard')} className="back-btn">← Back to Dashboard</button>
            <AnnouncementsAndEvents />
          </>
        )}

        {activeView === 'messaging' && (
          <>
            <button onClick={() => navigate('/staff/dashboard')} className="back-btn">← Back to Dashboard</button>
            <Messaging />
          </>
        )}

        {activeView === 'leave-request' && (
          <>
            <button onClick={() => navigate('/staff/dashboard')} className="back-btn">← Back to Dashboard</button>
            <LeaveRequest />
          </>
        )}

        {activeView === 'schedule' && (
          <>
            <button onClick={() => navigate('/staff/dashboard')} className="back-btn">← Back to Dashboard</button>
            <div className="schedule-view">
              <h2>Weekly Schedule</h2>
              <div className="course-selector">
                <label>Select Course to Schedule: </label>
                <select value={selectedCourse || ''} onChange={(e) => setSelectedCourse(e.target.value)}>
                  <option value="">-- Select Course --</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                  ))}
                </select>
              </div>
              <div className="schedule-section">
                <h3>8 AM - 8 PM (Click a slot to assign selected course)</h3>
                <div className="schedule-grid">
                  <div className="schedule-header">
                    <div className="time-column">Time</div>
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                      <div key={day} className="day-column">{day}</div>
                    ))}
                  </div>
                  <div className="schedule-body">
                    {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                      <div key={hour} className="schedule-row">
                        <div className="time-cell">
                          {hour === 12 ? '12 PM - 1 PM' : hour > 12 ? `${hour - 12} PM - ${hour - 11} PM` : hour === 11 ? '11 AM - 12 PM' : `${hour} AM - ${hour + 1} AM`}
                        </div>
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                          const schedule = schedules.find(s => s.day === day && s.start_hour === hour);
                          return (
                            <div 
                              key={`${day}-${hour}`} 
                              className={`schedule-cell ${schedule ? 'occupied' : ''}`}
                              onClick={() => !schedule && handleScheduleClick(day, hour)}
                            >
                              {schedule && (
                                <div className="schedule-content">
                                  <span>{schedule.course_code}</span>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(schedule.id); }} className="delete-schedule-btn">×</button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    
  );
};

export default StaffDashboard;
