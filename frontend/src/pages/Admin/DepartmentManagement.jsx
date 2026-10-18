import React, { useState, useEffect } from "react";
import { coreService } from "../../api/coreService";
import "../Admin/DepartmentManagement.css";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await coreService.getAllDepartments();
      setDepartments(data);
      setError("");
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ name: "", code: "", description: "" });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleEditClick = (department) => {
    setEditingId(department.id);
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || "",
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.code) {
      setError("Name and Code are required fields");
      return;
    }

    try {
      if (editingId) {
        const response = await coreService.updateDepartment(
          editingId,
          formData
        );
        setDepartments(
          departments.map((dept) =>
            dept.id === editingId ? response.data : dept
          )
        );
        setSuccess("Department updated successfully");
      } else {
        const response = await coreService.createDepartment(formData);
        setDepartments([...departments, response.data]);
        setSuccess("Department created successfully");
      }
      setShowForm(false);
      setFormData({ name: "", code: "", description: "" });
    } catch (error) {
      console.error("Error saving department:", error);
      if (error.response?.data) {
        const errorMsg = Object.values(error.response.data).flat().join(", ");
        setError(errorMsg || "Failed to save department");
      } else {
        setError("Failed to save department");
      }
    }
  };

  const handleDeleteClick = async (departmentId) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        setError("");
        await coreService.deleteDepartment(departmentId);
        setDepartments(departments.filter((dept) => dept.id !== departmentId));
        setSuccess("Department deleted successfully");
      } catch (error) {
        console.error("Error deleting department:", error);
        setError("Failed to delete department");
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ name: "", code: "", description: "" });
    setError("");
  };

  return (
    <div className="department-management">
      <div className="department-header">
        <button
          className="add-department-btn"
          onClick={handleAddClick}
          disabled={showForm}
        >
          + Add Department
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="department-form-container">
          <h3>{editingId ? "Edit Department" : "Create New Department"}</h3>
          <form onSubmit={handleSubmit} className="department-form">
            <div className="form-group">
              <label htmlFor="name">Department Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="code">Department Code *</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., CS"
                maxLength="10"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Department description (optional)"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingId ? "Update" : "Create"} Department
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="departments-list">
        {loading ? (
          <div className="loading">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="no-departments">
            No departments found.{" "}
            {!showForm && <span>Create one to get started!</span>}
          </div>
        ) : (
          <div className="departments-table">
            <div className="table-header">
              <div className="col-name">Name</div>
              <div className="col-code">Code</div>
              <div className="col-description">Description</div>
              <div className="col-actions">Actions</div>
            </div>
            {departments.map((department) => (
              <div key={department.id} className="table-row">
                <div className="col-name">{department.name}</div>
                <div className="col-code">{department.code}</div>
                <div className="col-description">
                  {department.description || "—"}
                </div>
                <div className="col-actions">
                  <button
                    className="edit-btnn"
                    onClick={() => handleEditClick(department)}
                    disabled={showForm}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(department.id)}
                    disabled={showForm}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentManagement;
