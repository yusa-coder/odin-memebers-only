import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

const ADMIN_PASSCODE = 'admin456';

export default function Login() {
  const navigate = useNavigate();
  const login = useStore((state) => state.login);
  const users = useStore((state) => state.users);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    adminPasscode: '',
  });
  
  const [error, setError] = useState('');
  const [showAdminInput, setShowAdminInput] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    const user = users.find((u) => u.email === formData.email);
    if (user?.isAdmin) {
      if (formData.adminPasscode !== ADMIN_PASSCODE) {
        setError('Invalid admin passcode');
        return;
      }
    }
    
    const loggedInUser = login(formData.email, formData.password);
    
    if (loggedInUser) {
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleEmailBlur = () => {
    const user = users.find((u) => u.email === formData.email);
    if (user?.isAdmin) {
      setShowAdminInput(true);
    } else {
      setShowAdminInput(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Login to your account</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              className="form-input"
              placeholder="john@example.com"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="••••••••"
            />
          </div>
          
          {showAdminInput && (
            <div className="form-group">
              <label className="form-label">Admin Passcode</label>
              <input
                type="password"
                name="adminPasscode"
                value={formData.adminPasscode}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter admin passcode"
              />
            </div>
          )}
          
          {error && (
            <div className="alert-error">{error}</div>
          )}
          
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </form>
        
        <p className="auth-link">
          Don't have an account?{' '}
          <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
