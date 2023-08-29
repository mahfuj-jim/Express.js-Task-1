const { success, failure } = require("../util/common.js");
const Restaurant = require("../models/restaurant.js");

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
      const { restaurantId } = req.query;
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
      const { restaurantId } = req.query;
      const result = await Restaurant.createRestaurantReview(
        restaurantId,
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
}

module.exports = new RestaurantController();
