const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user && user.role === "admin") {
      next(); 
    } else {
      res.status(403).json({ message: "Access denied. Admins only." });
    }
  } catch (error) {
    console.error("Admin Middleware Error:", error);
    res.status(500).json({ message: "Server error checking admin privileges" });
  }
};

module.exports = adminMiddleware;
