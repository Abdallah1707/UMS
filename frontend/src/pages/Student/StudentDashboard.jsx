import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import { communityService } from '../../api/communityService';
import { curriculumService } from '../../api/curriculumService';
import CourseList from './CourseList';
import MyCourses from './MyCourses';
import Grades from './Grades';
import AnnouncementsAndEvents from '../../components/AnnouncementsAndEvents';
import Messaging from './Messaging';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeView, setActiveView] = useState('overview');
  const [unreadCount, setUnreadCount] = useState(0);
  const [schedules, setSchedules] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);

  useEffect(() => {
    loadUnreadCount();
    
    // Refresh count when returning to this page
    const handleFocus = () => loadUnreadCount();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam) {
      setActiveView(viewParam);
    } else {
      setActiveView('overview');
    }
  }, [searchParams]);

  const loadUnreadCount = async () => {
    try {
      const response = await communityService.getInbox();
      const unread = response.data.filter(msg => !msg.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };
  const [gpa, setGpa] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);

  useEffect(() => {
    const fetchGradesData = async () => {
      try {
        const data = await curriculumService.getStudentGrades();
        setGpa(data.gpa);
        setTotalCredits(data.total_credits);
      } catch (error) {
        console.error('Error fetching grades data:', error);
      }
    };

    fetchGradesData();
  }, []);

  useEffect(() => {
    if (activeView === 'schedule') {
      fetchScheduleData();
    }
  }, [activeView]);

  const fetchScheduleData = async () => {
    try {
      const schedulesRes = await curriculumService.getSchedules();
      setSchedules(schedulesRes.data);
    } catch (error) {
      console.error('Failed to fetch schedule data:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h2>Student Dashboard</h2>
        <div className="nav-user">
          <span>Welcome, {user?.first_name || user?.username}</span>
          <button onClick={() => navigate('/student/dashboard?view=messaging')} className="message-icon-btn" title="Messages">
            <FaEnvelope />
            {unreadCount > 0 && <span className="message-notification-badge">{unreadCount}</span>}
          </button>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">

        {activeView === 'overview' && (
          <>
            <h1>Welcome, {user?.first_name}!</h1>

            <div className="stats-cards">
              <div className="stats-card">
                <h3>GPA</h3>
                <p className="stats-value">{gpa.toFixed(2)}</p>
              </div>
              <div className="stats-card">
                <h3>Total Credit Hours</h3>
                <p className="stats-value">{totalCredits}</p>
              </div>
            </div>

            <div className="dashboard-cards">
              <div className="dashboard-card" onClick={() => navigate('/student/dashboard?view=myCourses')}>
                <h3>My Courses</h3>
                <p>View your enrolled courses</p>
              </div>

              <div className="dashboard-card" onClick={() => navigate('/student/dashboard?view=availableCourses')}>
                <h3>Available Courses</h3>
                <p>Browse and register for courses</p>
              </div>

              <div className="dashboard-card" onClick={() => navigate('/student/dashboard?view=grades')}>
                <h3>Grades</h3>
                <p>View your academic performance</p>
              </div>

              <div className="dashboard-card" onClick={() => navigate('/student/dashboard?view=announcements')}>
                <h3>Announcements & Events</h3>
                <p>View university announcements and events</p>
              </div>

              <div
                className="dashboard-card"
                onClick={() => navigate('/student/report-maintenance')}
              >
                <h3>Report Maintenance</h3>
                <p>Submit a maintenance issue</p>
              </div>

              <div
                className="dashboard-card"
                onClick={() => navigate('/student/my-maintenance-tickets')}
              >
                <h3>My Tickets</h3>
                <p>View your maintenance tickets</p>
              </div>

              <div className="dashboard-card" onClick={() => navigate('/student/dashboard?view=schedule')}>
                <h3>Schedule</h3>
                <p>View your course schedule</p>
              </div>

              <div className="dashboard-card" onClick={() => navigate('/student/publications')}>
                <h3>Research Publications</h3>
                <p>Browse faculty publications</p>
              </div>

              <div className="dashboard-card" onClick={() => navigate('/student/attendance')}>
                <h3>My Attendance</h3>
                <p>View your attendance records</p>
              </div>
            </div>
          </>
        )}

        {activeView === 'myCourses' && (
          <>
            <button onClick={() => navigate('/student/dashboard')} className="back-btn">
              ← Back to Dashboard
            </button>
            <MyCourses />
          </>
        )}

        {activeView === 'availableCourses' && (
          <>
            <button onClick={() => navigate('/student/dashboard')} className="back-btn">
              ← Back to Dashboard
            </button>
            <CourseList />
          </>
        )}

        {activeView === 'grades' && (
          <>
            <button onClick={() => navigate('/student/dashboard')} className="back-btn">
              ← Back to Dashboard
            </button>
            <Grades />
          </>
        )}

        {activeView === 'announcements' && (
          <>
            <button onClick={() => navigate('/student/dashboard')} className="back-btn">
              ← Back to Dashboard
            </button>
            <AnnouncementsAndEvents />
          </>
        )}

        {activeView === 'messaging' && (
          <>
            <button onClick={() => { navigate('/student/dashboard'); loadUnreadCount(); }} className="back-btn">
              ← Back to Dashboard
            </button>
            <Messaging onMessageRead={loadUnreadCount} />
          </>
        )}

        {activeView === 'schedule' && (
          <>
            <button onClick={() => navigate('/student/dashboard')} className="back-btn">← Back to Dashboard</button>
            <div className="schedule-view">
              <h2>My Course Schedule</h2>
              <div className="schedule-section">
                <h3>8 AM - 8 PM</h3>
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
                            <div key={`${day}-${hour}`} className={`schedule-cell ${schedule ? 'occupied' : ''}`}>
                              {schedule && <span>{schedule.course_code}</span>}
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

export default StudentDashboard;
