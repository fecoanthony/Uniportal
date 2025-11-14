export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // check if user exists and if their role is in allowed roles
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions" });
    }
    next(); // user is allowed
  };
};
