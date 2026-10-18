import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coreService } from '../../api/coreService';
import './CreateUser.css';

const CreateUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    user_type: 'professor',
    phone_number: '',
    enrollment_year: '',
    department: '',
    hire_date: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await coreService.getAllDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(010|012|011|015)\d{8}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (formData.phone_number && !validatePhoneNumber(formData.phone_number)) {
      setError("Phone number must be 11 digits starting with 010, 012, 011, or 015.");
      return;
    }

    setLoading(true);

    try {
      // Prepare data based on user type
      const dataToSend = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        user_type: formData.user_type,
        phone_number: formData.phone_number,
      };

      // Add student-specific fields
      if (formData.user_type === 'student') {
        dataToSend.enrollment_year = parseInt(formData.enrollment_year);
      }

      // Add staff-specific fields
      if (['professor', 'ta'].includes(formData.user_type)) {
        dataToSend.department = parseInt(formData.department);
        dataToSend.hire_date = formData.hire_date;
      }

      // Add student department if selected
      if (formData.user_type === 'student' && formData.department) {
        dataToSend.department = parseInt(formData.department);
      }

      const response = await coreService.createUser(dataToSend);
      
      setSuccess({
        message: response.message,
        username: response.user.username,
        password: response.default_password,
      });

      // Reset form
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        user_type: 'professor',
        phone_number: '',
        enrollment_year: '',
        department: '',
        hire_date: '',
      });
    } catch (err) {
      const errorData = err.response?.data;
      if (typeof errorData === 'object') {
        const errorMessages = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        setError(errorMessages);
      } else {
        setError('Failed to create user');
      }
    } finally {
      setLoading(false);
    }
  };

  const isStudent = formData.user_type === 'student';
  const isStaff = ['professor', 'ta'].includes(formData.user_type);

  return (
    <div className="create-user-container">
      <div className="create-user-header">
        <h1>Create New User</h1>
        <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <h3>User Created Successfully!</h3>
          <p><strong>Username:</strong> {success.username}</p>
          <p><strong>Default Password:</strong> {success.password}</p>
          <p className="note">⚠️ Please share these credentials with the user. They will be required to change their password on first login.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-user-form">
        {/* User Type */}
        <div className="form-group">
          <label htmlFor="user_type">User Type *</label>
          <select
            id="user_type"
            name="user_type"
            value={formData.user_type}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="professor">Professor</option>
            <option value="ta">Teaching Assistant</option>
          </select>
        </div>

        {/* Basic Information */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="e.g., john.doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="user@university.edu"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="first_name">First Name *</label>
            <input
              id="first_name"
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name *</label>
            <input
              id="last_name"
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="phone_number">Phone Number *</label>
          <input
            id="phone_number"
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="01012345678"
            pattern="^(010|012|011|015)\d{8}$"
            title="Phone number must be 11 digits starting with 010, 012, 011, or 015."
          />
          <small className="form-hint">Phone number must be 11 digits starting with 010, 012, 011, or 015.</small>
        </div>

        {/* Student-specific fields */}
        {isStudent && (
          <>
            <div className="form-group">
              <label htmlFor="enrollment_year">Enrollment Year *</label>
              <input
                id="enrollment_year"
                type="number"
                name="enrollment_year"
                value={formData.enrollment_year}
                onChange={handleChange}
                required
                disabled={loading}
                min="2000"
                max="2100"
                placeholder="2024"
              />
            </div>
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select Department (Optional)</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Staff-specific fields */}
        {isStaff && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="hire_date">Hire Date</label>
                <input
                  id="hire_date"
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          </>
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creating User...' : 'CREATE USER'}
        </button>
      </form>
    </div>
  );
};

export default CreateUser;