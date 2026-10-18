import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { coreService } from "../../api/coreService";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, userTypeFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      const response = await coreService.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (userTypeFilter !== "all") {
      filtered = filtered.filter((user) => user.user_type === userTypeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await coreService.deleteUser(userId);
        setUsers(users.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user");
      }
    }
  };

  const handleEditUser = (userId) => {
    window.location.href = `/admin/users/${userId}/edit`;
  };

  const handleResetPassword = async (userId, userEmail) => {
    if (window.confirm(`Send password reset email to ${userEmail}?`)) {
      try {
        await coreService.sendPasswordResetEmail(userId);
        alert("Password reset email sent successfully!");
      } catch (error) {
        console.error("Error sending reset email:", error);
        alert("Failed to send password reset email");
      }
    }
  };

  const getUserCounts = () => {
    return {
      all: users.length,
      student: users.filter((u) => u.user_type === "student").length,
      professor: users.filter((u) => u.user_type === "professor").length,
      ta: users.filter((u) => u.user_type === "ta").length,
      parent: users.filter((u) => u.user_type === "parent").length,
    };
  };

  const counts = getUserCounts();

  return (
    <>
      <div className="dashboard-header">
        <h1>User Management</h1>
        <Link to="/admin/users/create" className="create-user-btn">
          + Create New User
        </Link>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search users by name, username, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="tabs-container">
        <button
          className={`tab ${userTypeFilter === "all" ? "active" : ""}`}
          onClick={() => setUserTypeFilter("all")}
        >
          All Users ({counts.all})
        </button>
        <button
          className={`tab ${userTypeFilter === "student" ? "active" : ""}`}
          onClick={() => setUserTypeFilter("student")}
        >
          Students ({counts.student})
        </button>
        <button
          className={`tab ${userTypeFilter === "professor" ? "active" : ""}`}
          onClick={() => setUserTypeFilter("professor")}
        >
          Professors ({counts.professor})
        </button>
        <button
          className={`tab ${userTypeFilter === "ta" ? "active" : ""}`}
          onClick={() => setUserTypeFilter("ta")}
        >
          TAs ({counts.ta})
        </button>
        <button
          className={`tab ${userTypeFilter === "parent" ? "active" : ""}`}
          onClick={() => setUserTypeFilter("parent")}
        >
          Parents ({counts.parent})
        </button>
      </div>

      <div className="users-list">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="no-users">No users found</div>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <div>Username</div>
              <div>Name</div>
              <div>Email</div>
              <div>Type</div>
              <div>Department/Student</div>
              <div>Actions</div>
            </div>
            {filteredUsers.map((user) => (
              <div key={user.id} className="table-row">
                <div>{user.username}</div>
                <div>
                  {user.first_name} {user.last_name}
                </div>
                <div>{user.email}</div>
                <div>
                  <span className={`user-type ${user.user_type}`}>
                    {user.user_type}
                  </span>
                </div>
                <div>
                  {user.user_type === "parent" ? (
                    user.linked_student_id ? (
                      <span style={{ color: "#28a745", fontSize: "0.9em" }}>
                        Student: {user.linked_student_id}
                        <br />
                        <small>{user.linked_student_email}</small>
                      </span>
                    ) : (
                      <span style={{ color: "#dc3545", fontSize: "0.9em" }}>
                        No student linked
                      </span>
                    )
                  ) : (
                    user.department || "N/A"
                  )}
                </div>
                <div className="actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEditUser(user.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="reset-btn"
                    onClick={() => handleResetPassword(user.id, user.email)}
                  >
                    Send Reset Email
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default UserManagement;
