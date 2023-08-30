const { failure } = require("../util/common.js");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

async function authenticateUser(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return failure(res, 401, "Error Occurred", "Authentication required");
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

async function userLoginValidation(req, res, next) {
  const { email, password } = JSON.parse(req.body);

  const errors = {};

  if (!email || email === "") {
    errors.email = "Email was not provided";
  }

  if (!password || password === "") {
    errors.password = "Password was not provided";
  }

  if (Object.keys(errors).length > 0) {
    return failure(res, 422, "Invalid Input", errors);
  }

  const user = await User.findByEmail(email);
  if (!user) {
    return failure(res, 401, "Authentication failed", "Email Doesn't Exist");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return failure(res, 401, "Authentication failed", "Wrong Password");
  }

  next();
}

module.exports = { authenticateUser, userLoginValidation };
