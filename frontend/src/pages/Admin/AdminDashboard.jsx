import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import UserManagement from "./UserManagement";
import DepartmentManagement from "./DepartmentManagement";
import CourseManagement from "./CourseManagement";
import AnnouncementsAndEvents from "./AnnouncementsAndEvents";
import "./AdminDashboard.css";
import ClassroomManagement from "./ClassroomManagement";
import MaintenanceManagement from "./MaintenanceManagement";
import PerformanceReviewManagement from "./PerformanceReviewManagement";
import ProfessionalDevelopmentManagement from "./ProfessionalDevelopmentManagement";
import PublicationManagement from "./PublicationManagement";
import LeaveManagement from "./LeaveManagement";
import PayrollManagement from "./PayrollManagement";
import ResourceAllocation from "./ResourceAllocation";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="dashboard-container">
      <nav className="dashboard-navv">
        <h2>Admin Dashboard</h2>
        <div className="nav-user">
          <span>Welcome, {user?.first_name || user?.username}</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <button
            className={`sidebar-tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`sidebar-tab ${activeTab === "departments" ? "active" : ""}`}
            onClick={() => setActiveTab("departments")}
          >
            Departments
          </button>
          <button
            className={`sidebar-tab ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            Courses
          </button>
          <button
            className={`sidebar-tab ${activeTab === "announcements" ? "active" : ""}`}
            onClick={() => setActiveTab("announcements")}
          >
            Announcements & Events
          </button>
          <button
            className={`sidebar-tab ${activeTab === "classrooms" ? "active" : ""}`}
            onClick={() => setActiveTab("classrooms")}
          >
            Classrooms
          </button>
          <button
            className={`sidebar-tab ${activeTab === "maintenance" ? "active" : ""}`}
            onClick={() => setActiveTab("maintenance")}
          >
            Maintenance
          </button>
          <button
            className={`sidebar-tab ${activeTab === "performance" ? "active" : ""}`}
            onClick={() => setActiveTab("performance")}
          >
            Performance
          </button>
          <button
            className={`sidebar-tab ${activeTab === "applications" ? "active" : ""}`}
            onClick={() => setActiveTab("applications")}
          >
            Applications
          </button>
          <button
            className={`sidebar-tab ${activeTab === "professional-dev" ? "active" : ""}`}
            onClick={() => setActiveTab("professional-dev")}
          >
            Prof. Development
          </button>
          <button
            className={`sidebar-tab ${activeTab === "publications" ? "active" : ""}`}
            onClick={() => setActiveTab("publications")}
          >
            Publications
          </button>
          <button
            className={`sidebar-tab ${activeTab === "leave-requests" ? "active" : ""}`}
            onClick={() => setActiveTab("leave-requests")}
          >
            Leave Requests
          </button>
          <button
            className={`sidebar-tab ${activeTab === "payroll" ? "active" : ""}`}
            onClick={() => setActiveTab("payroll")}
          >
            Payroll
          </button>
          <button
            className={`sidebar-tab ${activeTab === "resources" ? "active" : ""}`}
            onClick={() => setActiveTab("resources")}
          >
            Resource Allocation
          </button>
        </aside>

        {/* Main Content */}
        <div className="dashboard-content">
        {activeTab === "users" && <UserManagement />}
        {activeTab === "departments" && <DepartmentManagement />}
        {activeTab === "courses" && <CourseManagement />}
        {activeTab === "announcements" && <AnnouncementsAndEvents />}
        {activeTab === "classrooms" && <ClassroomManagement />}
        {activeTab === "maintenance" && <MaintenanceManagement />}
        {activeTab === "performance" && <PerformanceReviewManagement />}
        {activeTab === "applications" && (
          <div style={{ marginTop: '2rem' }}>
            <iframe 
              src="/admin/applications" 
              style={{ width: '100%', height: '600px', border: 'none' }}
              title="Applications"
            />
          </div>
        )}
        {activeTab === "professional-dev" && <ProfessionalDevelopmentManagement />}
        {activeTab === "publications" && <PublicationManagement />}
        {activeTab === "leave-requests" && <LeaveManagement />}
        {activeTab === "payroll" && <PayrollManagement />}
        {activeTab === "resources" && <ResourceAllocation />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
