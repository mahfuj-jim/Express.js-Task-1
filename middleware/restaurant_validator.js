const { failure } = require("../util/common.js");
const Restaurant = require("../models/restaurant.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

async function authenticateRestaurant(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return failure(res, 401, "Error Occurred", "Authentication required");
  }

  const token = authHeader.substring(7);

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const role = decodedToken.role;
    const restaurant = decodedToken.restaurant;

    if (role != "restaurant") {
      return failure(res, 403, "Error Occurred", "Invalid Token");
    }

    const responseUserData = await Restaurant.getAllRestaurantData();
    const restaurantData = responseUserData.data;
    const restaurantIndex = restaurantData.findIndex(
      (item) => item.id == restaurant.id
    );

    if (restaurantIndex == -1) {
      return failure(res, 403, "Error Occurred", "Invalid Restaurant");
    }

    next();
  } catch (err) {
    return failure(res, 403, "Error Occurred", "Invalid Token");
  }
}

module.exports = {
  authenticateRestaurant,
};
