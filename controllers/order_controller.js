const OrderModel = require("../models/order_model");
const CartModel = require("../models/cart_model");
const TransactionModel = require("../models/transaction_model");
const UserModel = require("../models/user_model");
const RestaurantModel = require("../models/restaurant_model");
const RiderModel = require("../models/rider_model");
const { success, failure, writeToLogFile } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const HTTP_RESPONSE = require("../constants/status_response");
const RESPONSE_MESSAGE = require("../constants/response_message");

class OrderController {
  async getAllOrder(req, res) {
    try {
      const orders = await OrderModel.find()
        .populate({
          path: "users",
          select: "_id name phoneNumber",
        })
        .populate({
          path: "restaurants",
          select: "_id name contactNumber location",
        })
        .populate({
          path: "riders",
          select: "_id name phoneNumber",
        });

      if (!orders) {
        writeToLogFile(`Error: Get all order`);
        return failure(
          res,
          HTTP_STATUS.OK,
          HTTP_RESPONSE.OK,
          RESPONSE_MESSAGE.ORDER_NOT_FOUND
        );
      }

      writeToLogFile(`Get All Order`);
      return success(res, HTTP_STATUS.OK, HTTP_RESPONSE.OK, orders);
    } catch (err) {
      writeToLogFile(`Error: Get All Order ${err}`);
      return failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.SIGNUP_FAILED,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createOrder(req, res) {
    try {
      const { user_id } = JSON.parse(req.body);
      let orderList = [];
      let totalPrice = 0;

      const user = await UserModel.findOne({ _id: user_id });
      if (!user) {
        writeToLogFile(
          `Error: Create a Order for User with ID ${user_id} ${err}`
        );
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.USER_NOT_FOUND
        );
      }

      const cart = await CartModel.findOne({ users: user_id });
      if (!cart || !cart.restaurants || !cart.orderList || cart.orderList.length === 0) {
        writeToLogFile(
          `Error: Create a Order for User with ID ${user_id} Cart is not Available`
        );
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.CART_NOT_FOUND
        );
      }

      const restaurant = await RestaurantModel.findOne({
        _id: cart.restaurants,
      });
      if (!restaurant) {
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.RESTAURANT_NOT_FOUND
        );
      }

      cart.orderList.map((orderItem) => {
        restaurant.menu.map((item) => {
          if (orderItem.dishId.toString() === item._id.toString()) {
            totalPrice += item.price * orderItem.quantity;
            orderList.push({
              dishName: item.dishName,
              price: item.price,
              quantity: orderItem.quantity,
            });
          }
        });
      });

      const rider = await RiderModel.findOne({
        isActive: true,
        isEngaged: false,
      });
      if (!rider) {
        writeToLogFile(`Create a order for User with ID ${user_id}`);
        return success(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.RIDER_NOT_FOUND
        );
      }

      const order = {
        time: new Date(),
        orderStatus: "Pending",
        deliveryFee: restaurant.deliveryOptions.deliveryFee,
        orderList: orderList,
        location: user.location,
        riders: rider._id,
        restaurants: restaurant._id,
        users: user._id,
        totalPrice: totalPrice,
      };

      const createOrder = await OrderModel.create(order);

      if (!createOrder) {
        writeToLogFile(`Error: Create a order for User with ID ${userId}`);
        return failure(
          res,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGE.FAILED_CREATE_ORDER,
          HTTP_RESPONSE.INTERNAL_SERVER_ERROR
        );
      }

      rider.isEngaged = true;
      await rider.save();

      cart.restaurants = null;
      cart.orderList = [];
      await cart.save();

      writeToLogFile(`Create a order for User with ID ${user_id}`);
      return success(res, HTTP_STATUS.CREATED, HTTP_RESPONSE.OK, createOrder);
    } catch (err) {
      console.log(err);
      writeToLogFile(`Error: Failed to Create Order for User${err}`);
      failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.LOGIN_FAILED,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }

  async confirmOrderByRestaurant(req, res) {
    try {
      const { confirm } = req.query;
      const { orderId } = JSON.parse(req.body);

      const order = await OrderModel.findOne({ _id: orderId });

      if (!order) {
        writeToLogFile(`Error: Failed Confirm Order with ID ${orderId}`);
        failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.ORDER_NOT_FOUND
        );
      }

      if (confirm != "true") {
        writeToLogFile(`Error: Failed Confirm Order with ID ${orderId}`);
        return failure(
          res,
          HTTP_STATUS.BAD_REQUEST,
          RESPONSE_MESSAGE.FAILED_TO_PROCESS,
          RESPONSE_MESSAGE.INVALID_DATA
        );
      }

      if (order.orderStatus !== "Pending") {
        writeToLogFile(`Error: Failed Confirm Order with ID ${orderId}`);
        return failure(
          res,
          HTTP_STATUS.BAD_REQUEST,
          RESPONSE_MESSAGE.FAILED_TO_PROCESS,
          RESPONSE_MESSAGE.INVALID_REQUEST
        );
      }

      order.orderStatus = "Processing";
      await order.save();

      writeToLogFile(`Confirm Order with ID ${orderId}`);
      return success(
        res,
        HTTP_STATUS.OK,
        HTTP_RESPONSE.OK,
        RESPONSE_MESSAGE.ORDER_PROCESSING
      );
    } catch (err) {
      console.log(err);
      writeToLogFile(`Error: Failed Confirm Order ${err}`);
      failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.LOGIN_FAILED,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }

  async handoverOrderByRestaurant(req, res) {
    try {
      const { confirm } = req.query;
      const { orderId } = JSON.parse(req.body);

      const order = await OrderModel.findOne({ _id: orderId });

      if (!order) {
        writeToLogFile(`Error: Failed Handover Order with ID ${orderId}`);
        failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.ORDER_NOT_FOUND
        );
      }

      if (confirm != "true") {
        writeToLogFile(`Error: Failed Handover Order with ID ${orderId}`);
        return failure(
          res,
          HTTP_STATUS.BAD_REQUEST,
          RESPONSE_MESSAGE.FAILED_TO_PROCESS,
          RESPONSE_MESSAGE.INVALID_DATA
        );
      }

      if (order.orderStatus !== "Processing") {
        writeToLogFile(`Error: Failed Handover Order with ID ${orderId}`);
        return failure(
          res,
          HTTP_STATUS.BAD_REQUEST,
          RESPONSE_MESSAGE.FAILED_TO_PROCESS,
          RESPONSE_MESSAGE.INVALID_REQUEST
        );
      }

      order.orderStatus = "Ready";
      await order.save();

      writeToLogFile(`Handover Order with ID ${orderId}`);
      return success(
        res,
        HTTP_STATUS.OK,
        HTTP_RESPONSE.OK,
        RESPONSE_MESSAGE.ORDER_READY
      );
    } catch (err) {
      console.log(err);
      writeToLogFile(`Error: Failed Handover Order ${err}`);
      failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.LOGIN_FAILED,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }

  async reachOrderByRider(req, res) {
    try {
      const { confirm } = req.query;
      const { orderId } = JSON.parse(req.body);

      const order = await OrderModel.findOne({ _id: orderId });

      if (!order) {
        writeToLogFile(`Error: Failed Reach Order with ID ${orderId}`);
        failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.ORDER_NOT_FOUND
        );
      }

      if (confirm != "true") {
        writeToLogFile(`Error: Failed Reach Order with ID ${orderId}`);
        return failure(
          res,
          HTTP_STATUS.BAD_REQUEST,
          RESPONSE_MESSAGE.FAILED_TO_PROCESS,
          RESPONSE_MESSAGE.INVALID_DATA
        );
      }

      if (order.orderStatus !== "Ready") {
        writeToLogFile(`Error: Failed Reach Order with ID ${orderId}`);
        return failure(
          res,
          HTTP_STATUS.BAD_REQUEST,
          RESPONSE_MESSAGE.FAILED_TO_PROCESS,
          RESPONSE_MESSAGE.INVALID_REQUEST
        );
      }

      order.orderStatus = "Reached";
      await order.save();

      writeToLogFile(`Reach Order with ID ${orderId}`);
      return success(
        res,
        HTTP_STATUS.OK,
        HTTP_RESPONSE.OK,
        RESPONSE_MESSAGE.ORDER_REACHED
      );
    } catch (err) {
      console.log(err);
      writeToLogFile(`Error: Failed Reach Order ${err}`);
      failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.FAILED_TO_PROCESS,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deliveryOrder(req, res) {
    try {
      const { confirm } = req.query;
      const { orderId } = JSON.parse(req.body);

      const order = await OrderModel.findOne({ _id: orderId });

      if (!order) {
        writeToLogFile(`Error: Failed Delivery Order with ID ${orderId}`);
        failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.ORDER_NOT_FOUND
        );
      }

      if (confirm != "true") {
        writeToLogFile(`Error: Failed Delivery Order with ID ${orderId}`);
        return failure(
          res,
          HTTP_STATUS.BAD_REQUEST,
          RESPONSE_MESSAGE.FAILED_TO_PROCESS,
          RESPONSE_MESSAGE.INVALID_DATA
        );
      }

      if (order.orderStatus !== "Reached") {
        writeToLogFile(`Error: Failed Delivery Order with ID ${orderId}`);
        return failure(
          res,
          HTTP_STATUS.BAD_REQUEST,
          RESPONSE_MESSAGE.FAILED_TO_PROCESS,
          RESPONSE_MESSAGE.INVALID_REQUEST
        );
      }

      const rider = await RiderModel.findOne({ _id: order.riders });
      if (!rider) {
        writeToLogFile(`Error: Failed Delivery Order`);
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.RIDER_NOT_FOUND
        );
      }

      const transaction = await TransactionModel.findOne({ orders: orderId });

      if (!transaction) {
        writeToLogFile(`Error: Failed Delivery Order`);
        return failure(
          res,
          HTTP_STATUS.CONFLICT,
          HTTP_RESPONSE.CONFLICT,
          RESPONSE_MESSAGE.TRANSACTION_NOT_MADE
        );
      }

      order.orderStatus = "Delivered";
      await order.save();

      rider.isEngaged = false;
      await rider.save();

      writeToLogFile(`Deliveried Order with ID ${orderId}`);
      return success(
        res,
        HTTP_STATUS.OK,
        HTTP_RESPONSE.OK,
        RESPONSE_MESSAGE.ORDER_DELIVERED
      );
    } catch (err) {
      console.log(err);
      writeToLogFile(`Error: Failed Delivery Order ${err}`);
      failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.FAILED_TO_PROCESS,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }
}

module.exports = new OrderController();
