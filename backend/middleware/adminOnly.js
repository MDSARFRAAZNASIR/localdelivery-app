// backend/middleware/adminOnly.js
module.exports = function adminOnly(req, res, next) {
  // req.user must be set by auth middleware
  if (!req.user) {
    return res.status(401).json({ success: false, message: "No token" });
  }
  if (!req.user.isAdmin) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  return next();
};
// backend/middleware/adminOnly.js
module.exports = function adminOnly(req, res, next) {
  // req.user must be set by auth middleware
  if (!req.user) {
    return res.status(401).json({ success: false, message: "No token" });
  }
  if (!req.user.isAdmin) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  return next();
};
