const { failure } = require("../util/common.js");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

async function authenticateUser(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return failure(res, 401, "Failed to Execute", "Authentication required");
  }

  const token = authHeader.substring(7);

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const role = decodedToken.role;
    const user = decodedToken.user;

    if (role != "user") {
      return failure(res, 403, "Failed to Execute", "Invalid Token");
    }

    const responseUserData = await User.getAllUserData();
    const userData = responseUserData.data;
    const userIndex = userData.findIndex(
      (item) => item.user_id == user.user_id
    );

    if (userIndex == -1) {
      return failure(res, 403, "Failed to Execute", "Invalid User");
    }

    next();
  } catch (err) {
    return failure(res, 403, "Failed to Execute", "Invalid Token");
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

  const user = await User.findByEmail(email);
  if (!user) {
    errors.email = "Email Doesn't Exist";
  }

  if (Object.keys(errors).length > 0) {
    return failure(res, 422, "Invalid Input", errors);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return failure(res, 401, "Authentication failed", "Wrong Password");
  }

  next();
}

async function userSignupValidation(req, res, next) {
  const { name, email, password, phoneNumber, location } = JSON.parse(req.body);

  const errors = {};

  if (!email || email === "") {
    errors.email = "Email was not provided";
  } else {
    const user = await User.findByEmail(email);
    if (user) {
      errors.email = "Email Already Exists";
    }
  }

  if (!name || name === "") {
    errors.name = "Name was not provided";
  }

  if (!password || password === "") {
    errors.password = "Password was not provided";
  }

  if (!phoneNumber || phoneNumber === "") {
    errors.phoneNumber = "Phone Number was not provided";
  }

  if (!location || location === "") {
    errors.password = "Location was not provided";
  }

  if (Object.keys(errors).length > 0) {
    return failure(res, 422, "Invalid Input", errors);
  }

  next();
}

module.exports = {
  authenticateUser,
  userLoginValidation,
  userSignupValidation,
};
