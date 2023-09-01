const { success, failure } = require("../util/common.js");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { getCurrentDateTime } = require("../util/common.js");
const RestaurantModel = require("../models/restaurant_model.js");
const OrderModel = require("../models/order_models.js");

class OrderController {
  async getAllOrderData(req, res) {
    try {
      const status = req.query.onProccessOrder;

      const filter = {};

      if (status == true) {
        filter.order_status = "On Process";
      }

      const orders = await OrderModel.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $lookup: {
            from: "restaurants",
            localField: "restaurant",
            foreignField: "_id",
            as: "restaurant",
          },
        },
        {
          $addFields: {
            total_price: {
              $add: [
                "$delivery_fee",
                {
                  $sum: {
                    $map: {
                      input: "$order_list",
                      as: "item",
                      in: { $multiply: ["$$item.price", "$$item.quantity"] },
                    },
                  },
                },
              ],
            },
          },
        },
        {
          $project: {
            _id: 1,
            time: 1,
            order_status: 1,
            delivery_fee: 1,
            order_list: 1,
            location: 1,
            delivered_time: 1,
            user: {
              name: 1,
              phoneNumber: 1,
            },
            restaurant: {
              name: 1,
              contactNumber: 1,
              location: 1,
            },
            total_price: 1,
          },
        },
      ]);

      if (orders) {
        success(res, "Successfully Received.", orders);
      } else {
        failure(res, 500, "Failed to get data.", "Internal Server Issue");
      }
    } catch (error) {
      console.log(error);
      failure(res, 500, "Failed to get data", "Internal Server Issue");
    }
  }

  async getOrderById(req, res) {
    const orderId = req.params.orderId;

    try {
      const orders = await OrderModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(orderId) } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $lookup: {
            from: "restaurants",
            localField: "restaurant",
            foreignField: "_id",
            as: "restaurant",
          },
        },
        {
          $addFields: {
            total_price: {
              $add: [
                "$delivery_fee",
                {
                  $sum: {
                    $map: {
                      input: "$order_list",
                      as: "item",
                      in: { $multiply: ["$$item.price", "$$item.quantity"] },
                    },
                  },
                },
              ],
            },
          },
        },
        {
          $project: {
            _id: 1,
            time: 1,
            order_status: 1,
            delivery_fee: 1,
            order_list: 1,
            location: 1,
            delivered_time: 1,
            user: {
              name: 1,
              phoneNumber: 1,
            },
            restaurant: {
              name: 1,
              contactNumber: 1,
              location: 1,
            },
            total_price: 1,
          },
        },
      ]);

      if (orders.length > 0) {
        success(res, "Successfully Received.", orders);
      } else {
        failure(res, 404, "No order data found.", "No orders available.");
      }
    } catch (error) {
      console.log(error);
      failure(res, 500, "Failed to get data", "Internal Server Issue");
    }
  }

  async createOrder(req, res) {
    try {
      const authHeader = req.header("Authorization");
      const token = authHeader.substring(7);
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user_id = decodedToken.user._id;

      let order = JSON.parse(req.body);

      const restaurantId = order.restaurant;
      const delivery_options = await RestaurantModel.findOne(
        { _id: new mongoose.Types.ObjectId(restaurantId) },
        { "deliveryOptions.deliveryFee": 1, _id: 0 }
      );

      order = {
        ...order,
        user: user_id,
        deliveryFee: delivery_options.deliveryOptions.deliveryFee,
        time: getCurrentDateTime(),
        order_status: "On Process",
      };

      await OrderModel.create(order)
        .then((newOrder) => {
          return success(res, "Successfully Created.", newOrder);
        })
        .catch((err) => {
          console.log(err);
          return failure(
            res,
            500,
            "Failed to create new order",
            "Internal Server Issue"
          );
        });
    } catch (err) {
      return failure(
        res,
        500,
        "Failed to create new order",
        "Internal Server Issue"
      );
    }
  }

  async getOrderByRestaurantId(req, res) {
    try {
      const authHeader = req.header("Authorization");
      const token = authHeader.substring(7);
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const restaurantId = decodedToken.restaurant._id;

      const status = req.query.onProccessOrder;

      const filter = {
        restaurant: restaurantId,
      };

      if (status == true) {
        filter.order_status = "On Process";
      }

      await OrderModel.find(filter)
        .populate("user", "name phoneNumber")
        .populate("restaurant", "name contactNumber location")
        .then((orders) => {
          return success(res, "Successfully Received.", {
            total_orders: orders.length,
            orders: orders,
          });
        })
        .catch((err) => {
          return failure(
            res,
            500,
            "Failed to get data",
            "Internal Server Error"
          );
          v;
        });
    } catch (error) {
      return failure(res, 500, "Failed to get data", "Internal Server Error");
    }
  }
}

// class OrderController {

//   async getOrderByRestaurantId(req, res){
//     try {
//       const authHeader = req.header("Authorization");
//       const token = authHeader.substring(7);
//       const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//       const id = decodedToken.restaurant.id;

//       const result = await Order.getRestaurantOrder(id);
//       if (result.success) {
//         success(res, "Successfully Received.", result.data);
//       } else {
//         failure(res, result.code, "Failed to get data", result.error);
//       }
//     } catch (err) {
//       console.log(err);
//       failure(res, 500, "Failed to get data", "Internal Server Error");
//     }
//   }

//   async getOrderByUserID(req, res) {
//     try {
//       const authHeader = req.header("Authorization");
//       const token = authHeader.substring(7);
//       const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//       const user_id = decodedToken.user.user_id;

//       const result = await Order.getUserOrder(user_id);
//       if (result.success) {
//         success(res, "Successfully Received.", result.data);
//       } else {
//         failure(res, result.code, "Failed to get data", result.error);
//       }
//     } catch (err) {
//       console.log(err);
//       failure(res, 500, "Failed to get data", "Internal Server Error");
//     }
//   }

//   async completeOrder(req, res) {
//     try {
//       const { orderId, order_status } = req.query;

//       if (order_status === "done") {
//         const result = await Order.completeOrder(orderId);

//         if (result.success) {
//           success(res, "Successfully Done.", result.data);
//         } else {
//           failure(res, result.code, "Failed to update", result.error);
//         }
//       } else {
//         failure(res, 400, "Failed to connect", "Invalid request");
//       }
//     } catch (err) {
//       console.log(err);
//       failure(res, 500, "Failed to update", "Internal Server Error");
//     }
//   }

//   async createOrder(req, res) {
//     try {
//       const authHeader = req.header("Authorization");
//       const token = authHeader.substring(7);
//       const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//       const user_id = decodedToken.user.user_id;

//       const result = await Order.createOrder(user_id, JSON.parse(req.body));

//       if (result.success) {
//         success(res, "Successfully Created.", result.data);
//       } else {
//         failure(res, result.code, "Failed to create new order", result.error);
//       }
//     } catch (err) {
//       failure(res, 500, "Failed to create new order", "Internal Server Issue");
//     }
//   }
// }

module.exports = new OrderController();
