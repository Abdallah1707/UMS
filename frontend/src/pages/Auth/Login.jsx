import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';
import { FaUser, FaLock } from "react-icons/fa";


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      
      if (result.success) {
        // Check if first login
        if (result.user.is_first_login) {
          navigate('/first-login-password-change');
        } else {
          // Redirect based on user type
          redirectToDashboard(result.user.user_type);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    }

    setLoading(false);
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
        navigate('/staff/dashboard');
        break;
      case 'parent':
        navigate('/parent/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>University Management System</h1>
        <h2>Login</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-groupp">
            <div className="input-wrapper">
              <div className="circle-icon"><FaUser /></div>
              <input
                type="text"
                style={{borderRadius: '999px'}}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-groupp">
            <div className="input-wrapper">
              <div className="circle-icon"><FaLock /></div>
              <input
                style={{borderRadius: '999px'}}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>

        <div className="apply-text">
          <p>New Student? <Link to="/apply">Apply</Link></p>
        </div>

        <div className="help-text">
          <p>Contact your administrator if you need assistance.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;