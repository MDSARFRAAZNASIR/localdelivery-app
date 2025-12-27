/**
 * Admin-only middleware
 * Requires auth middleware to run before this
 */
module.exports = function adminMiddlle(req, res, next) {
  try {
    // auth middleware must attach user to req
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.isAdmin !== true) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    return res.status(500).json({
      success: false,
      message: "Admin authorization failed",
    });
  }
};
