import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { coreService } from '../../api/coreService';
import './PasswordReset.css';

const PasswordReset = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: '',
    new_password_confirm: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if token exists
  React.useEffect(() => {
    if (!token || token === ':token') {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token || token === ':token') {
      setError('Invalid reset token');
      return;
    }

    if (formData.new_password !== formData.new_password_confirm) {
      setError('Passwords do not match');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await coreService.confirmPasswordReset({
        token,
        new_password: formData.new_password,
        new_password_confirm: formData.new_password_confirm
      });
      
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.log('Error response:', err.response?.data);
      const errorData = err.response?.data?.errors || err.response?.data;
      const errorMsg = errorData?.token?.[0] 
        || errorData?.new_password?.[0]
        || errorData?.new_password_confirm?.[0]
        || errorData?.detail?.[0]
        || errorData?.non_field_errors?.[0]
        || JSON.stringify(errorData)
        || 'Failed to reset password. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-reset-container">
      <div className="password-reset-card">
        <h1>Reset Password</h1>
        <p className="subtitle">Enter your new password below.</p>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="new_password"
              placeholder="Enter new password"
              value={formData.new_password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="8"
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="new_password_confirm"
              placeholder="Confirm new password"
              value={formData.new_password_confirm}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="8"
            />
          </div>

          <button type="submit" disabled={loading} className="reset-button">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="form-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;