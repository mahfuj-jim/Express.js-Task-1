const OrderModel = require("../models/order_model");
const UserModel = require("../models/user_model");
const RestaurantModel = require("../models/restaurant_model");
const { success, failure, writeToLogFile } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const HTTP_RESPONSE = require("../constants/status_response");
const RESPONSE_MESSAGE = require("../constants/response_message");

class OrderController {
  async createOrder(req, res) {
    try {
      const { userId } = req.params;
      let orderList = [];

      const user = await UserModel.findOne({ _id: userId });
      if (!user) {
        writeToLogFile(
          `Error: Create a Order for User with ID ${userId} ${err}`
        );
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.USER_NOT_FOUND
        );
      }

      if (
        !user.cart ||
        !user.cart.restaurant ||
        !user.cart.orderList ||
        user.cart.orderList.length === 0
      ) {
        writeToLogFile(
          `Error: Create a Order for User with ID ${userId} ${err}`
        );
        return failure(
          res,
          HTTP_STATUS.BAD_REQUEST,
          HTTP_RESPONSE.BAD_REQUEST,
          RESPONSE_MESSAGE.INVALID_CART
        );
      }

      const restaurant = await RestaurantModel.findOne({
        _id: user.cart.restaurant,
      });
      if (!restaurant) {
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.RESTAURANT_NOT_FOUND
        );
      }

      user.cart.orderList.map((orderItem) => {
        restaurant.menu.map((item) => {
          if (orderItem._id.toString() === item._id.toString()) {
            orderList.push({
              dishName: item.dishName,
              price: item.price,
              quantity: orderItem.quantity,
            });
          }
        });
      });

      const order = {
        time: new Date(),
        orderStatus: "Pending",
        deliveryFee: restaurant.deliveryOptions.deliveryFee,
        orderList: orderList,
        location: user.location,
        restaurant: restaurant._id,
        user: user._id,
      }

      console.log(order);

      writeToLogFile(`Create a order for User with ID ${userId}`);
      return success(res, HTTP_STATUS.CREATED, HTTP_RESPONSE.OK, user);
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
}

module.exports = new OrderController();
