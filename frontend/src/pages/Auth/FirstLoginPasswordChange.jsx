import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { coreService } from '../../api/coreService';
import './FirstLoginPasswordChange.css';

const FirstLoginPasswordChange = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await coreService.firstLoginPasswordChange(newPassword, confirmPassword);
      
      // Update user state
      updateUser({ is_first_login: false });
      
      // Redirect based on user type
      redirectToDashboard(user.user_type);
    } catch (err) {
      setError(err.response?.data?.new_password?.[0] || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const redirectToDashboard = (userType) => {
    switch (userType) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'student':
        navigate('/student/dashboard');
        break;
      case 'professor':
      case 'ta':
      case 'admin_staff':
        navigate('/staff/dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="password-change-container">
      <div className="password-change-card">
        <h1>First Login - Change Password</h1>
        <p className="info-message">
          For security reasons, you must change your password before continuing.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              minLength={8}
            />
            <small>Must be at least 8 characters long</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
        
        <button onClick={handleLogout} className="logout-button">
          Cancel and Logout
        </button>
      </div>
    </div>
  );
};

export default FirstLoginPasswordChange;