// Check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Check if user is a member
function ensureMember(req, res, next) {
  if (req.isAuthenticated() && req.user.is_member) {
    return next();
  }
  res.status(403).json({ message: 'Membership required' });
}

// Check if user is an admin
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.is_admin) {
    return next();
  }
  res.status(403).json({ message: 'Admin access required' });
}

module.exports = {
  ensureAuthenticated,
  ensureMember,
  ensureAdmin
};
