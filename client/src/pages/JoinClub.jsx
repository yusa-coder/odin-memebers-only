import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function JoinClub() {
  const navigate = useNavigate();
  const currentUser = useStore((state) => state.currentUser);
  
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!passcode) {
      setError('Please enter the passcode');
      return;
    }
    
    if (passcode === 'secret123') {
      if (currentUser) {
        const users = useStore.getState().users;
        const updatedUsers = users.map((u) =>
          u.id === currentUser.id ? { ...u, isMember: true } : u
        );
        useStore.setState({ 
          users: updatedUsers,
          currentUser: { ...currentUser, isMember: true }
        });
        setSuccess(true);
        setTimeout(() => navigate('/'), 1500);
      }
    } else {
      setError('Invalid passcode. Ask a member for the secret code!');
    }
  };

  if (!currentUser) {
    return (
      <div className="auth-page">
        <div className="auth-card access-denied">
          <h1>Access Denied</h1>
          <p>You must be logged in to join the club.</p>
        </div>
      </div>
    );
  }

  if (currentUser.isMember) {
    return (
      <div className="auth-page">
        <div className="auth-card already-member">
          <div className="already-member-emoji">🎉</div>
          <h1>You're a Member!</h1>
          <p>You've already joined the club. Enjoy!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="page-emoji">🔐</div>
          <h1 className="auth-title">Join the Club</h1>
          <p className="auth-subtitle">Enter the secret passcode to become a member</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Secret Passcode</label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError('');
              }}
              className="form-input"
              placeholder="Enter secret passcode"
            />
          </div>
          
          {error && (
            <div className="alert-error">{error}</div>
          )}
          
          {success && (
            <div className="alert-success">Welcome to the club! Redirecting...</div>
          )}
          
          <button type="submit" className="btn btn-primary">
            Join Now
          </button>
        </form>
        
        <p className="hint-text">Passcode: secret123 (for testing)</p>
      </div>
    </div>
  );
}
