const { success, failure } = require("../util/common.js");
const mongoose = require("mongoose");
const OrderModel = require("../models/order_models.js");

class OrderController {
  async getAllOrderData(req, res) {
    try {
      const orders = await OrderModel.aggregate([
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
}

// class OrderController {
//   async getAllOrderData(req, res) {
//     try {
//       const result = await Order.getAllOrderData(true);

//       if (result.success) {
//         success(res, "Successfully Received.", result.data);
//       } else {
//         failure(res, result.code, "Failed to get data", result.error);
//       }
//     } catch (err) {
//       failure(res, 500, "Failed to get data", result.error);
//     }
//   }

//   async getOrderById(req, res) {
//     try {
//       const { id, restaurant_id } = req.query;

//       if (id !== undefined) {
//         const result = await Order.getOrderById(id);
//         if (result.success) {
//           success(res, "Successfully Received.", result.data);
//         } else {
//           failure(res, result.code, "Failed to get data", result.error);
//         }
//       } else if (restaurant_id !== undefined) {
//         const result = await Order.getRestaurantOrder(restaurant_id);
//         if (result.success) {
//           success(res, "Successfully Received.", result.data);
//         } else {
//           failure(res, result.code, "Failed to get data", result.error);
//         }
//       } else {
//         failure(res, 400, "Failed to connect", "Request not found");
//       }
//     } catch (err) {
//       failure(res, 500, "Failed to get data", "Internal Server Error");
//     }
//   }

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
