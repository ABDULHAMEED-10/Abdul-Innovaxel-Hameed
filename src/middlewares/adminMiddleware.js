const adminMiddleware = (req, res, next) => {
  return new Promise((resolve, reject) => {
    if (req.user && req.user.role === "admin") {
      resolve();
    } else {
      reject();
    }
  })
    .then(() => next())
    .catch(() =>
      res.status(403).json({ message: "Access denied. Admins only." })
    );
};

module.exports = adminMiddleware;
