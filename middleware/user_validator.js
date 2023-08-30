const { failure } = require("../util/common.js");
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

async function authenticateUser(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return failure(
      res,
      401,
      "Error Occurred",
      "Authentication required"
    );
  }

  const token = authHeader.substring(7);

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const role = decodedToken.role;
    const user = decodedToken.user;

    if (role != "user") {
      return failure(res, 403, "Error Occurred", "Invalid Token");
    }

    const responseUserData = await User.getAllUserData();
    const userData = responseUserData.data;
    const userIndex = userData.findIndex(
      (item) => item.user_id == user.user_id
    );

    if (userIndex == -1) {
      return failure(res, 403, "Error Occurred", "Invalid User");
    }

    next();
  } catch (err) {
    return failure(res, 403, "Error Occurred", "Invalid Token");
  }
}

module.exports = { authenticateUser };
