import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function CreateMessage() {
  const navigate = useNavigate();
  const currentUser = useStore((state) => state.currentUser);
  const addMessage = useStore((state) => state.addMessage);
  
  const [formData, setFormData] = useState({
    title: '',
    text: '',
  });
  
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.text.trim()) {
      newErrors.text = 'Message content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm() || !currentUser) return;
    
    const newMessage = {
      id: crypto.randomUUID(),
      title: formData.title,
      text: formData.text,
      authorId: currentUser.id,
      authorName: `${currentUser.firstName} ${currentUser.lastName}`,
      createdAt: new Date(),
    };
    
    addMessage(newMessage);
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (!currentUser) {
    return (
      <div className="auth-page">
        <div className="auth-card access-denied">
          <h1>Access Denied</h1>
          <p>You must be logged in to create a message.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-message-page">
      <div className="create-message-card">
        <div className="create-message-header">
          <div className="page-emoji">✉️</div>
          <h1 className="create-message-title">Create New Message</h1>
          <p className="create-message-subtitle">Share something with the club</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="Enter message title"
            />
            {errors.title && (
              <p className="form-error">{errors.title}</p>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              name="text"
              value={formData.text}
              onChange={handleChange}
              rows={6}
              className={`form-textarea ${errors.text ? 'error' : ''}`}
              placeholder="Write your message here..."
            />
            {errors.text && (
              <p className="form-error">{errors.text}</p>
            )}
          </div>
          
          <button type="submit" className="btn btn-primary">
            Post Message
          </button>
        </form>
      </div>
    </div>
  );
}
