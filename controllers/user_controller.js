const { success, failure } = require("../util/common.js");
// const User = require("../models/user.js");
const UserModel = require("../models/user_model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

class UserController {
  async getAllUserData(req, res) {
    try {
      const users = await UserModel.find({}, {password: false});
      success(res, "Successfully Received User Data.", users);
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

  async signup(req, res) {
    try {
      let newUser = JSON.parse(req.body);

      const existingUser = await User.findByEmail(newUser.email);
      if (existingUser) {
        return failure(res, 401, "Signup failed", "Email Already Exist");
      }

      const hashedPassword = await bcrypt.hash(newUser.password, 10);
      newUser = { ...newUser, password: hashedPassword };

      const result = await User.createUser(newUser);

      if (!result.success) {
        return failure(res, result.code, "Authentication failed", result.error);
      }

      const user = result.data;
      const token = jwt.sign(
        {
          user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            phone_number: user.phoneNumber,
            location: user.location,
          },
          role: "user",
        },
        process.env.ACCESS_TOKEN_SECRET
      );

      return success(res, "User registered successfully", { token, user });
    } catch (err) {
      console.log(err);
      failure(res, 500, "Failed to register user", "Internal Server Issue");
    }
  }

  async login(req, res) {
    try {
      const { email } = JSON.parse(req.body);

      const user = await User.findByEmail(email);

      const token = jwt.sign(
        {
          user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            phone_number: user.phoneNumber,
            location: user.location,
          },
          role: "user",
        },
        process.env.ACCESS_TOKEN_SECRET
      );

      return success(res, "Authentication successful", {
        token,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          phone_number: user.phoneNumber,
          location: user.location,
        },
      });
    } catch (err) {
      console.log(err);
      failure(res, 500, "Login failed", "Internal Server Issue");
    }
  }
}

module.exports = new UserController();
