const { success, failure } = require("../util/common.js");
const mongoose = require("mongoose");
const UserModel = require("../models/user_model.js");
const RestaurantModel = require("../models/restaurant_model.js");
const AuthModel = require("../models/auth_model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

class AuthController {
  async signup(req, res) {
    try {
      const response = JSON.parse(req.body);
      const { email, password, role } = response;

      const newInstance = response;
      delete newInstance.role;
      delete newInstance.password;

      let id, token;

      if (role === 1) {
        await UserModel.create(newInstance)
          .then((createdUser) => {
            id = createdUser._id;

            token = jwt.sign(
              {
                user: {
                  _id: id,
                  name: createdUser.name,
                  email: createdUser.email,
                  phone_number: createdUser.phoneNumber,
                  location: createdUser.location,
                },
                role: "user",
              },
              process.env.ACCESS_TOKEN_SECRET
            );
          })
          .catch((error) => {
            console.log(error);
            failure(res, 500, "Failed to register", "Internal Server Issue");
          });
      } else if (role === 2) {
        await RestaurantModel.create(newInstance)
          .then((createdRestaurant) => {
            id = createdRestaurant._id;

            token = jwt.sign(
              {
                restaurant: {
                  _id: id,
                  name: createdRestaurant.name,
                  location: createdRestaurant.location,
                  cuisine: createdRestaurant.cuisine,
                  rating: createdRestaurant.rating,
                  contactNumber: createdRestaurant.contactNumber,
                  owner: createdRestaurant.owner,
                  email: createdRestaurant.email,
                },
                role: "restaurant",
              },
              process.env.ACCESS_TOKEN_SECRET
            );
          })
          .catch((error) => {
            console.log(error);
            return failure(
              res,
              500,
              "Failed to register",
              "Internal Server Issue"
            );
          });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newAuth = {
        email: email,
        password: hashedPassword,
        role: role,
        user: role === 1 ? id : undefined,
        restaurant: role === 2 ? id : undefined,
      };

      await AuthModel.create(newAuth)
        .then((auth) => {
          return success(res, "Registered successfully", {
            token,
            data: { id: id, ...newInstance },
          });
        })
        .catch((err) => {
          console.log(err);
          return failure(
            res,
            500,
            "Failed to register",
            "Internal Server Issue"
          );
        });
    } catch (err) {
      console.log(err);
      return failure(res, 500, "Failed to register", "Internal Server Issue");
    }
  }

  async login(req, res) {
    try {
      const { email, password } = JSON.parse(req.body);

      AuthModel.findOne({ email })
        .populate("user")
        .populate("restaurant")
        .exec()
        .then(async (auth) => {
          const isPasswordValid = await bcrypt.compare(password, auth.password);

          if (!isPasswordValid) {
            return failure(res, 401, "Login failed", "Invalid Credential");
          }

          return success(
            res,
            "Authentication successful",
            auth.role === 1 ? auth.user : auth.restaurant
          );

          //   const token = jwt.sign(
          //     {
          //       restaurant: {
          //         _id: restaurant._id,
          //         name: restaurant.name,
          //         location: restaurant.location,
          //         cuisine: restaurant.cuisine,
          //         rating: restaurant.rating,
          //         contactNumber: restaurant.contactNumber,
          //         owner: restaurant.owner,
          //         email: restaurant.email,
          //       },
          //       role: "restaurant",
          //     },
          //     process.env.ACCESS_TOKEN_SECRET
          //   );

          //   return success(res, "Authentication successful", {
          //     token,
          //     restaurant: {
          //       id: restaurant._id,
          //       name: restaurant.name,
          //       location: restaurant.location,
          //       cuisine: restaurant.cuisine,
          //       rating: restaurant.rating,
          //       contactNumber: restaurant.contactNumber,
          //       owner: restaurant.owner,
          //       email: restaurant.email,
          //     },
          //   });
        })
        .catch((error) => {
          return failure(res, 401, "Login failed", "Invalid Credential");
        });
    } catch (err) {
      console.log(err);
      failure(res, 500, "Login failed", "Internal Server Issue");
    }
  }
}

module.exports = new AuthController();
