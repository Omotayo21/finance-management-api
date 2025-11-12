function authenticateUser(req, res, next) {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please provide x-user-id header",
    });
  }

  req.userId = userId;
  next();
}

module.exports = { authenticateUser };
