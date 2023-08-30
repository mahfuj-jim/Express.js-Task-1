const { success, failure } = require("../util/common.js");
const Order = require("../models/order.js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

class OrderController {
  async getAllOrderData(req, res) {
    try {
      const result = await Order.getAllOrderData(true);

      if (result.success) {
        success(res, "Successfully Received.", result.data);
      } else {
        failure(res, result.code, "Failed to get data", result.error);
      }
    } catch (err) {
      failure(res, 500, "Failed to get data", result.error);
    }
  }

  async getOrderById(req, res) {
    try {
      const { id, restaurant_id, user_id } = req.query;

      if (id !== undefined) {
        const result = await Order.getOrderById(id);
        if (result.success) {
          success(res, "Successfully Received.", result.data);
        } else {
          failure(res, result.code, "Failed to get data", result.error);
        }
      } else if (restaurant_id !== undefined) {
        const result = await Order.getRestaurantOrder(restaurant_id);
        if (result.success) {
          success(res, "Successfully Received.", result.data);
        } else {
          failure(res, result.code, "Failed to get data", result.error);
        }
      } else if (user_id !== undefined) {
        const result = await Order.getUserOrder(user_id);
        if (result.success) {
          success(res, "Successfully Received.", result.data);
        } else {
          failure(res, result.code, "Failed to get data", result.error);
        }
      } else {
        failure(res, 400, "Failed to connect", "Request not found");
      }
    } catch (err) {
      failure(res, 500, "Failed to get data", "Internal Server Error");
    }
  }

  async getOrderByUserID(req, res) {
    try {
      const authHeader = req.header("Authorization");
      const token = authHeader.substring(7);
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user_id = decodedToken.user.user_id;

      const result = await Order.getUserOrder(user_id);
      if (result.success) {
        success(res, "Successfully Received.", result.data);
      } else {
        failure(res, result.code, "Failed to get data", result.error);
      }
    } catch (err) {
      console.log(err);
      failure(res, 500, "Failed to get data", "Internal Server Error");
    }
  }

  async completeOrder(req, res) {
    try {
      const { orderId, order_status } = req.query;

      if (order_status === "done") {
        const result = await Order.completeOrder(orderId);

        if (result.success) {
          success(res, "Successfully Done.", result.data);
        } else {
          failure(res, result.code, "Failed to update", result.error);
        }
      } else {
        failure(res, 400, "Failed to connect", "Invalid request");
      }
    } catch (err) {
      console.log(err);
      failure(res, 500, "Failed to update", "Internal Server Error");
    }
  }

  async createOrder(req, res) {
    try {
      const result = await Order.createOrder(JSON.parse(req.body));

      if (result.success) {
        success(res, "Successfully Created.", result.data);
      } else {
        failure(res, result.code, "Failed to create new order", result.error);
      }
    } catch (err) {
      failure(res, 500, "Failed to create new order", "Internal Server Issue");
    }
  }
}

module.exports = new OrderController();
