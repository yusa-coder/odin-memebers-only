import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Home() {
  const currentUser = useStore((state) => state.currentUser);
  const messages = useStore((state) => state.messages);
  const deleteMessage = useStore((state) => state.deleteMessage);
  
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const canViewDetails = currentUser?.isMember || currentUser?.isAdmin;
  const canDelete = currentUser?.isAdmin;

  const handleDelete = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessage(messageId);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="home-page">
      <div className="container">
        <div className="home-header">
          <h1 className="home-title">Club Messages</h1>
          <p className="home-subtitle">
            {canViewDetails 
              ? 'Welcome, club member!' 
              : 'Join the club to see author details'}
          </p>
        </div>

        <div className="nav-container">
          {!currentUser ? (
            <>
              <Link to="/login" className="nav-button nav-button-primary">
                Login
              </Link>
              <Link to="/signup" className="nav-button nav-button-secondary">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <div className="nav-user-info">
                <span className="nav-user-name">
                  Hello, <strong>{currentUser.firstName}</strong>!
                  {currentUser.isAdmin && <span className="admin-badge">👑 Admin</span>}
                  {currentUser.isMember && !currentUser.isAdmin && <span className="member-badge">✓ Member</span>}
                </span>
              </div>
              
              <Link to="/create-message" className="nav-button nav-button-primary">
                + New Message
              </Link>
              
              {!currentUser.isMember && (
                <Link to="/join-club" className="nav-button nav-button-amber">
                  Join Club
                </Link>
              )}
              
              <button
                onClick={() => {
                  useStore.getState().logout();
                  window.location.href = '/';
                }}
                className="nav-button btn-gray"
              >
                Logout
              </button>
            </>
          )}
        </div>

        <div className="messages-container">
          {sortedMessages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">💬</div>
              <h2 className="empty-title">No Messages Yet</h2>
              <p className="empty-text">
                {currentUser 
                  ? 'Be the first to post a message!' 
                  : 'Login to start the conversation'}
              </p>
            </div>
          ) : (
            sortedMessages.map((message) => (
              <div key={message.id} className="message-card">
                <div className="message-header">
                  <h3 className="message-title">{message.title}</h3>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="message-delete-btn"
                      title="Delete message"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                
                <p className="message-text">{message.text}</p>
                
                <div className="message-footer">
                  {canViewDetails ? (
                    <>
                      <span className="message-author">
                        By <span className="message-author-name">{message.authorName}</span>
                      </span>
                      <span className="message-date">
                        {formatDate(message.createdAt)}
                      </span>
                    </>
                  ) : (
                    <span className="message-hidden">
                      Author details hidden - join the club to see more
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {!canViewDetails && messages.length > 0 && (
          <div className="info-box">
            <h3 className="info-title">
              Want to see who's posting?
            </h3>
            <p className="info-text">
              Join the club by entering the secret passcode to see author details!
            </p>
            {currentUser && (
              <Link to="/join-club" className="info-button">
                Join Club Now
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
