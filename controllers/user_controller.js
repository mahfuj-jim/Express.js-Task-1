const { success, failure } = require("../util/common.js");
const UserModel = require("../models/user_model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

class UserController {
  async getAllUserData(req, res) {
    try {
      UserModel.find({}, { password: false })
        .then((users) => {
          success(res, "Successfully Received User Data.", users);
        })
        .catch((error) => {
          failure(res, 400, "Failed to get data", "User not found");
        });
    } catch (err) {
      failure(res, 500, "Failed to get user data", "Internal Server Issue");
    }
  }

  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      UserModel.findOne({ _id: userId }, { password: false })
        .then((user) => {
          success(res, "Successfully Received.", user);
        })
        .catch((error) => {
          failure(res, 400, "Failed to get data", "User not found");
        });
    } catch (err) {
      failure(res, 500, "Failed to get data", "Internal Server Issue");
    }
  }

  async signup(req, res) {
    try {
      const newUser = JSON.parse(req.body);

      const hashedPassword = await bcrypt.hash(newUser.password, 10);
      newUser.password = hashedPassword;

      UserModel.create(newUser)
        .then((createdUser) => {
          const token = jwt.sign(
            {
              user: {
                _id: createdUser._id,
                name: createdUser.name,
                email: createdUser.email,
                phone_number: createdUser.phoneNumber,
                location: createdUser.location,
              },
              role: "user",
            },
            process.env.ACCESS_TOKEN_SECRET
          );

          return success(res, "User registered successfully", {
            token,
            user: createdUser,
          });
        })
        .catch((error) => {
          console.log(error);
          failure(res, 500, "Failed to register user", "Internal Server Issue");
        });
    } catch (err) {
      console.log(err);
      failure(res, 500, "Failed to register user", "Internal Server Issue");
    }
  }

  async login(req, res) {
    try {
      const { email, password } = JSON.parse(req.body);

      UserModel.findOne({ email })
        .then(async (user) => {
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            return failure(res, 401, "Login failed", "Invalid password");
          }

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
        })
        .catch((error) => {
          return failure(res, 401, "Login failed", "User not found");
        });
    } catch (err) {
      console.error(err);
      failure(res, 500, "Login failed", "Internal Server Issue");
    }
  }
}

module.exports = new UserController();
