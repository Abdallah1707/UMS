import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Auth pages
import Login from "../pages/Auth/Login";
import FirstLoginPasswordChange from "../pages/Auth/FirstLoginPasswordChange";
import PasswordReset from "../pages/Auth/PasswordReset";
import Application from "../pages/Auth/Application";

// Admin pages
import AdminDashboard from "../pages/Admin/AdminDashboard";
import CreateUser from "../pages/Admin/CreateUser";
import EditUser from "../pages/Admin/EditUser";
import ClassroomManagement from "../pages/Admin/ClassroomManagement";
import MaintenanceTickets from "../pages/Admin/MaintenanceTickets";
import PerformanceReviewManagement from "../pages/Admin/PerformanceReviewManagement";
import Applications from "../pages/Admin/Applications";
import PayrollManagement from "../pages/Admin/PayrollManagement";
import ResourceAllocation from "../pages/Admin/ResourceAllocation";

// Student pages
import StudentDashboard from "../pages/Student/StudentDashboard";
import AssignmentList from "../pages/Student/AssignmentList";
import AssignmentSubmit from "../pages/Student/AssignmentSubmit";
import QuizTake from "../pages/Student/QuizTake";
import ReportMaintenance from "../pages/Student/ReportMaintenance";
import MyMaintenanceTickets from "../pages/Student/MyMaintenanceTickets";
import StudentPublications from "../pages/Student/StudentPublications";
import StudentAttendance from "../pages/Student/StudentAttendance";

// Staff pages
import StaffDashboard from "../pages/Staff/StaffDashboard";
import AssignmentManagement from "../pages/Staff/AssignmentManagement";
import SubmissionReview from "../pages/Staff/SubmissionReview";
import QuizSubmissionReview from "../pages/Staff/QuizSubmissionReview";
import BookClassroom from "../pages/Staff/BookClassroom";
import MyPerformanceReviews from "../pages/Staff/MyPerformanceReviews";
import ProfessionalDevelopment from "../pages/Staff/ProfessionalDevelopment";
import Publications from "../pages/Staff/Publications";
import AttendanceManagement from "../pages/Staff/AttendanceManagement";
import PayrollHistory from "../pages/Staff/PayrollHistory";
import ProfessionalDevelopmentManagement from "../pages/Admin/ProfessionalDevelopmentManagement";
import PublicationManagement from "../pages/Admin/PublicationManagement";

// Parent pages
import ParentDashboard from "../pages/Parent/ParentDashboard";
import ParentMessaging from "../pages/Parent/Messaging";
import Attendance from "../pages/Parent/Attendance";

// Error pages
import Unauthorized from "../pages/Auth/Unauthorized";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/apply" element={<Application />} />
      <Route path="/reset-password/:token" element={<PasswordReset />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* First login password change */}
      <Route
        path="/first-login-password-change"
        element={
          <ProtectedRoute>
            <FirstLoginPasswordChange />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/create"
        element={
          <ProtectedRoute adminOnly>
            <CreateUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:userId/edit"
        element={
          <ProtectedRoute adminOnly>
            <EditUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/classrooms"
        element={
          <ProtectedRoute adminOnly>
            <ClassroomManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/maintenance-tickets"
        element={
          <ProtectedRoute adminOnly>
            <MaintenanceTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/performance-reviews"
        element={
          <ProtectedRoute adminOnly>
            <PerformanceReviewManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <ProtectedRoute adminOnly>
            <Applications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/professional-development"
        element={
          <ProtectedRoute adminOnly>
            <ProfessionalDevelopmentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/publications"
        element={
          <ProtectedRoute adminOnly>
            <PublicationManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payroll"
        element={
          <ProtectedRoute adminOnly>
            <PayrollManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/resource-allocation"
        element={
          <ProtectedRoute adminOnly>
            <ResourceAllocation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Student routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedUserTypes={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments"
        element={<Navigate to="/student/dashboard?view=courses" replace />}
      />
      <Route
        path="/student/assignments/:id/submit"
        element={
          <ProtectedRoute allowedUserTypes={["student"]}>
            <AssignmentSubmit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/quizzes/:quizId/take"
        element={
          <ProtectedRoute allowedUserTypes={["student"]}>
            <QuizTake />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/report-maintenance"
        element={
          <ProtectedRoute allowedUserTypes={["student", "parent"]}>
            <ReportMaintenance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/my-maintenance-tickets"
        element={
          <ProtectedRoute allowedUserTypes={["student", "parent"]}>
            <MyMaintenanceTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/publications"
        element={
          <ProtectedRoute allowedUserTypes={["student"]}>
            <StudentPublications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/attendance"
        element={
          <ProtectedRoute allowedUserTypes={["student"]}>
            <StudentAttendance />
          </ProtectedRoute>
        }
      />

      {/* Staff routes */}
      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute allowedUserTypes={["staff", "professor", "ta"]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/assignments"
        element={
          <ProtectedRoute allowedUserTypes={["professor", "ta"]}>
            <AssignmentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/assignments/:id/submissions"
        element={
          <ProtectedRoute allowedUserTypes={["professor", "ta"]}>
            <SubmissionReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/quizzes/:id/submissions"
        element={
          <ProtectedRoute allowedUserTypes={["professor", "ta"]}>
            <QuizSubmissionReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/book-classroom"
        element={
          <ProtectedRoute allowedUserTypes={["professor", "ta"]}>
            <BookClassroom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/report-maintenance"
        element={
          <ProtectedRoute allowedUserTypes={["staff", "professor", "ta"]}>
            <ReportMaintenance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/my-maintenance-tickets"
        element={
          <ProtectedRoute allowedUserTypes={["staff", "professor", "ta"]}>
            <MyMaintenanceTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/performance-reviews"
        element={
          <ProtectedRoute allowedUserTypes={["professor", "ta"]}>
            <MyPerformanceReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/professional-development"
        element={
          <ProtectedRoute allowedUserTypes={["professor", "ta"]}>
            <ProfessionalDevelopment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/publications"
        element={
          <ProtectedRoute allowedUserTypes={["professor", "ta"]}>
            <Publications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/attendance"
        element={
          <ProtectedRoute allowedUserTypes={["professor", "ta"]}>
            <AttendanceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/payroll"
        element={
          <ProtectedRoute allowedUserTypes={["professor", "ta"]}>
            <PayrollHistory />
          </ProtectedRoute>
        }
      />

      {/* Parent routes */}
      <Route
        path="/parent/dashboard"
        element={
          <ProtectedRoute allowedUserTypes={["parent"]}>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/report-maintenance"
        element={
          <ProtectedRoute allowedUserTypes={["parent"]}>
            <ReportMaintenance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/my-maintenance-tickets"
        element={
          <ProtectedRoute allowedUserTypes={["parent"]}>
            <MyMaintenanceTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/messaging"
        element={
          <ProtectedRoute allowedUserTypes={["parent"]}>
            <ParentMessaging />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/attendance"
        element={
          <ProtectedRoute allowedUserTypes={["parent"]}>
            <Attendance />
          </ProtectedRoute>
        }
      />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
