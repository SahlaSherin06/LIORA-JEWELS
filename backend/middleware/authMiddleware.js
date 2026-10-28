const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      //  Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //  Find the user by ID from the token, and attach it to the request object
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      
      if (user.isActive === false) {
        return res.status(401).json({ message: "Not authorized, user account is deactivated" });
      }


      req.user = user;

      //  Move on to the next function 
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    // If no token was found at all
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = authMiddleware;