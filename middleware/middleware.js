const jwt = require("jsonwebtoken");
const User = require("../database/userSchema");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized HTTP, token not provided" });
  }

  const jwtToken = token.replace("Bearer", " ").trim();

  try {
    const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
    const userData = await User.findOne({ email: isVerified.email }).select('-password');
    req.user = userData;
    req.token = token;
    req.userID = userData._id;
    // console.log(userData);
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized HTTP, invalid token" });
  }
};

module.exports = authMiddleware;
