const { success, failure } = require("../util/common.js");
const User = require("../models/user.js");
const express = require("express");
const router = express.Router();

class UserController {
  async getAllUserData(req, res) {
    try {
      const result = await User.getAllUserData(true);
      if (result.success) {
        success(res, "Successfully Received User Data.", result.data);
      } else {
        failure(res, result.code, "Failed to get user data", result.error);
      }
    } catch (err) {
      failure(res, 500, "Failed to get user data", "Internal Server Issue");
    }
  }

  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const result = await User.getUserById(userId);

      if (result.success) {
        success(res, "Successfully Received.", result.data);
      } else {
        failure(res, result.code, "Failed to get data", result.error);
      }
    } catch (err) {
      failure(res, 500, "Failed to get data", "Internal Server Issue");
    }
  }
}

module.exports = new UserController();
