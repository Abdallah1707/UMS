import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coreService } from '../../api/coreService';
import './EditUser.css';

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    department: '',
    enrollment_year: '',
    hire_date: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchDepartments();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const userData = await coreService.getUserDetail(userId);
      setUser(userData);
      setFormData({
        username: userData.username || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone_number: userData.phone_number || '',
        department: userData.department || '',
        enrollment_year: userData.enrollment_year || '',
        hire_date: userData.hire_date || ''
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      alert('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await coreService.getAllDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(010|012|011|015)\d{8}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.phone_number && !validatePhoneNumber(formData.phone_number)) {
      alert("Phone number must be 11 digits starting with 010, 012, 011, or 015.");
      return;
    }
    
    setSaving(true);
    
    try {
      // Only send non-empty fields
      const updateData = {};
      Object.keys(formData).forEach(key => {
        if (key !== 'username' && formData[key] !== '' && formData[key] !== null) {
          if (key === 'department' && formData[key]) {
            updateData[key] = parseInt(formData[key]);
          } else if (key === 'enrollment_year' && formData[key]) {
            updateData[key] = parseInt(formData[key]);
          } else {
            updateData[key] = formData[key];
          }
        }
      });
      const result = await coreService.updateUser(userId, updateData);
      console.log('Update result:', result);
      alert('User updated successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Error updating user:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to update user';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading user data...</div>;
  }

  if (!user) {
    return <div className="error">User not found</div>;
  }

  return (
    <div className="edit-user-container">
      <div className="edit-user-header">
        <h1>Edit User: {user.username}</h1>
        <button 
          className="back-btn"
          onClick={() => navigate('/admin')}
        >
          ← Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="edit-user-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="01012345678"
                pattern="^(010|012|011|015)\d{8}$"
                title="Phone number must be 11 digits starting with 010, 012, 011, or 015."
              />
              <small className="form-hint">Phone number must be 11 digits starting with 010, 012, 011, or 015.</small>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Academic/Work Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {user.user_type === 'student' && (
            <div className="form-row">
              <div className="form-group">
                <label>User ID</label>
                <input
                  type="text"
                  value={user.user_id || 'Auto-generated'}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Enrollment Year</label>
                <input
                  type="number"
                  name="enrollment_year"
                  value={formData.enrollment_year}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {(user.user_type === 'professor' || user.user_type === 'ta') && (
            <div className="form-row">
              <div className="form-group">
                <label>User ID</label>
                <input
                  type="text"
                  value={user.user_id || 'Auto-generated'}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Hire Date</label>
                <input
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/admin')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="save-btn"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;