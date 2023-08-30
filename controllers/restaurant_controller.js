const { success, failure } = require("../util/common.js");
const Restaurant = require("../models/restaurant.js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

class RestaurantController {
  async getAllRestaurantData(req, res) {
    try {
      const result = await Restaurant.getAllRestaurantData(true);
      if (result.success) {
        success(res, "Successfully Received.", result.data);
      } else {
        failure(res, 500, "Failed to get data", result.error);
      }
    } catch (err) {
      failure(res, 500, "Failed to get data", "Internal Server Issue");
    }
  }

  async getRestaurantById(req, res) {
    try {
      const { restaurantId } = req.params;
      console.log(restaurantId);
      const result = await Restaurant.getRestaurantById(restaurantId);

      if (result.success) {
        success(res, "Successfully Received.", result.data);
      } else {
        failure(res, result.code, "Failed to get data", result.error);
      }
    } catch (err) {
      failure(res, 500, "Failed to get data", "Internal Server Issue");
    }
  }

  async createRestaurant(req, res) {
    try {
      const result = await Restaurant.createRestaurant(JSON.parse(req.body));

      if (result.success) {
        success(res, "Successfully Created.", result.data);
      } else {
        failure(
          res,
          result.code,
          "Failed to create new restaurant",
          result.error
        );
      }
    } catch (err) {
      failure(
        res,
        500,
        "Failed to create new restaurant",
        "Internal Server Issue"
      );
    }
  }

  async updateRestaurant(req, res) {
    try {
      const { restaurantId } = req.params;

      console.log(restaurantId);

      const result = await Restaurant.updateRestaurant(
        restaurantId,
        JSON.parse(req.body)
      );

      if (result.success) {
        success(res, "Successfully Updated.", result.data);
      } else {
        failure(res, result.code, "Failed to update data", result.error);
      }
    } catch (err) {
      failure(res, 500, "Failed to update data", "Internal Server Issue");
    }
  }

  async deleteRestaurantById(req, res) {
    try {
      const { restaurantId } = req.params;

      const result = await Restaurant.deleteRestaurantById(restaurantId);
      if (result.success) {
        success(res, "Successfully Deleted.", result.data);
      } else {
        failure(res, result.code, "Failed to delete data", result.error);
      }
    } catch (err) {
      failure(res, 500, "Failed to delete data", "Internal Server Issue");
    }
  }

  async getRestaurantReview(req, res) {
    try {
      const authHeader = req.header("Authorization");
      const token = authHeader.substring(7);
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const restaurantId = decodedToken.restaurant.id;

      const result = await Restaurant.getRestaurantReview(restaurantId);

      if (result.success) {
        success(res, "Successfully Received Reviews.", result.data);
      } else {
        failure(res, result.code, "Failed to get reviews", result.error);
      }
    } catch (err) {
      failure(res, 500, "Failed to get reviews", "Internal Server Error");
    }
  }

  async createRestaurantReview(req, res) {
    try {
      const authHeader = req.header("Authorization");
      const token = authHeader.substring(7);
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user_id = decodedToken.user.user_id;

      const { restaurantId } = req.query;
      const result = await Restaurant.createRestaurantReview(
        restaurantId,
        user_id,
        JSON.parse(req.body)
      );

      if (result.success) {
        success(res, "Successfully Received Reviews.", result.data);
      } else {
        failure(res, result.code, "Failed to add review", result.error);
      }
    } catch (err) {
      console.log(err);
      failure(res, 500, "Failed to add review", "Internal Server Error");
    }
  }

  async login(req, res) {
    try {
      const { email } = JSON.parse(req.body);

      const restaurant = await Restaurant.findByEmail(email);

      const token = jwt.sign(
        {
          restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            location: restaurant.location,
            cuisine: restaurant.cuisine,
            rating: restaurant.rating,
            contactNumber: restaurant.contactNumber,
            owner: restaurant.owner,
            email: restaurant.email
          },
          role: "restaurant",
        },
        process.env.ACCESS_TOKEN_SECRET
      );

      return success(res, "Authentication successful", {
        token,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          location: restaurant.location,
          cuisine: restaurant.cuisine,
          rating: restaurant.rating,
          contactNumber: restaurant.contactNumber,
          owner: restaurant.owner,
          email: restaurant.email
        },
      });
    } catch (err) {
      console.log(err);
      failure(res, 500, "Login failed", "Internal Server Issue");
    }
  }
}

module.exports = new RestaurantController();
