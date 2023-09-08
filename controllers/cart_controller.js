const CartModel = require("../models/cart_model");
const UserModel = require("../models/user_model");
const RestaurantModel = require("../models/restaurant_model");
const { success, failure, writeToLogFile } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const HTTP_RESPONSE = require("../constants/status_response");
const RESPONSE_MESSAGE = require("../constants/response_message");

class CartController {
  async createCart(req, res) {
    try {
      const { user_id } = req.params;
      const cart = JSON.parse(req.body);

      const user = await UserModel.findOne({ _id: user_id });

      if (!user) {
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.USER_NOT_FOUND
        );
      }

      const restaurant = await RestaurantModel.findOne({
        _id: cart.restaurant,
      });

      if (!restaurant) {
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.RESTAURANT_NOT_FOUND
        );
      }

      let currentCart = await CartModel.findOne({ users: user_id });
      if (!currentCart) {
        const newCart = {
          users: user_id,
          restaurants: restaurant._id,
          orderList: cart.orderList,
        };

        const createdCart = await CartModel.create(newCart);
        if (!createdCart) {
          writeToLogFile(
            `Error: Failed to Create Cart with User with ID ${user_id}`
          );
          return failure(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            RESPONSE_MESSAGE.SIGNUP_FAILED,
            HTTP_RESPONSE.INTERNAL_SERVER_ERROR
          );
        }

        writeToLogFile(`Cart with User with ID ${user_id}`);
        return success(
          res,
          HTTP_STATUS.CREATED,
          HTTP_RESPONSE.CREATED,
          createdCart
        );
      }

      currentCart.restaurants = restaurant._id;
      currentCart.orderList = cart.orderList;
      await currentCart.save();

      writeToLogFile(`Cart with User with ID ${user_id}`);
      return success(
        res,
        HTTP_STATUS.CREATED,
        HTTP_RESPONSE.CREATED,
        currentCart
      );
    } catch (err) {
      console.log(err);
      writeToLogFile(
        `Error: Failed to Create Cart with User with ID ${user_id} ${err}`
      );
      return failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.SIGNUP_FAILED,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteCart(req, res) {
    try {
      const { user_id } = req.params;

      const user = await UserModel.findOne({ _id: user_id });

      if (!user) {
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.USER_NOT_FOUND
        );
      }

      // user.cart = null;
      // await user.save();

      // writeToLogFile(`Delete Cart with User with ID ${user_id}`);
      // return success(
      //   res,
      //   HTTP_STATUS.OK,
      //   HTTP_RESPONSE.NO_CONTENT,
      //   RESPONSE_MESSAGE.DELETE_CART
      // );
    } catch (err) {
      console.log(err);
      writeToLogFile(
        `Error: Failed to Delete Cart with User with ID ${user_id} ${err}`
      );
      return failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.SIGNUP_FAILED,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }
}

module.exports = new CartController();
