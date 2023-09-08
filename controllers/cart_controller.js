const CartModel = require("../models/cart_model");
const UserModel = require("../models/user_model");
const RestaurantModel = require("../models/restaurant_model");
const { success, failure, writeToLogFile } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const HTTP_RESPONSE = require("../constants/status_response");
const RESPONSE_MESSAGE = require("../constants/response_message");

class CartController {
  async getCart(req, res) {
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

      const currentCart = await CartModel.findOne({ users: user_id });
      if (!currentCart) {
        writeToLogFile(
          `Error: Failed to Get Cart with User with ID ${user_id}`
        );
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.CART_NOT_FOUND
        );
      }

      writeToLogFile(`Get Cart with User with ID ${user_id}`);
      return success(res, HTTP_STATUS.OK, HTTP_RESPONSE.OK, currentCart);
    } catch (err) {
      console.log(err);
      writeToLogFile(
        `Error: Failed to Get Cart with User with ID ${user_id} ${err}`
      );
      return failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.FAILED_TO_PROCESS,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }

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

      cart.orderList.map((orderItem) => {
        const menuExists = restaurant.menu.find(
          (menu) => orderItem.dishId === menu._id.toString()
        );

        if (!menuExists) {
          writeToLogFile(
            `Error: Failed to Create Cart with User with ID ${user_id}`
          );
          return failure(
            res,
            HTTP_STATUS.NOT_FOUND,
            HTTP_RESPONSE.NOT_FOUND,
            RESPONSE_MESSAGE.INVALID_MENU
          );
        }
      });

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

      if (currentCart.orderList.length !== 0) {
        writeToLogFile(
          `Error: Failed to Create Cart with User with ID ${user_id}`
        );
        return failure(
          res,
          HTTP_STATUS.CONFLICT,
          HTTP_RESPONSE.CONFLICT,
          RESPONSE_MESSAGE.CART_ALREADY_EXISTS
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
        RESPONSE_MESSAGE.FAILED_TO_PROCESS,
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

      let currentCart = await CartModel.findOne({ users: user_id });
      if (!currentCart) {
        writeToLogFile(
          `Error: Failed to Delete Cart with User with ID ${user_id}`
        );
        return success(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.CART_NOT_FOUND
        );
      }

      try {
        if (currentCart.restaurants.toString() !== restaurant._id.toString()) {
          writeToLogFile(
            `Error: Failed to Add Item to Cart with User with ID ${user_id}`
          );
          return failure(
            res,
            HTTP_STATUS.CONFLICT,
            HTTP_RESPONSE.CONFLICT,
            RESPONSE_MESSAGE.CART_RESTAURANT_ERROR
          );
        }
      } catch (err) {
        writeToLogFile(
          `Error: Failed to Add Item to Cart with User with ID ${user_id}`
        );
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.CART_NOT_FOUND
        );
      }

      currentCart.restaurants = null;
      currentCart.orderList = [];
      await currentCart.save();

      writeToLogFile(`Delete Cart with User with ID ${user_id}`);
      return success(
        res,
        HTTP_STATUS.OK,
        HTTP_RESPONSE.OK,
        RESPONSE_MESSAGE.DELETE_CART
      );
    } catch (err) {
      console.log(err);
      writeToLogFile(
        `Error: Failed to Delete Cart with User with ID ${user_id} ${err}`
      );
      return failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.FAILED_TO_PROCESS,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }

  async addItemToCart(req, res) {
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

      let restaurant;
      try {
        restaurant = await RestaurantModel.findOne({
          _id: cart.restaurant,
        });
      } catch (err) {
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.RESTAURANT_NOT_FOUND
        );
      }

      if (!restaurant) {
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.RESTAURANT_NOT_FOUND
        );
      }

      cart.orderList.map((orderItem) => {
        const menuExists = restaurant.menu.find(
          (menu) => orderItem.dishId === menu._id.toString()
        );

        if (!menuExists) {
          writeToLogFile(
            `Error: Failed to Add Item to Cart with User with ID ${user_id}`
          );
          return failure(
            res,
            HTTP_STATUS.NOT_FOUND,
            HTTP_RESPONSE.NOT_FOUND,
            RESPONSE_MESSAGE.INVALID_MENU
          );
        }
      });

      let currentCart = await CartModel.findOne({ users: user_id });
      if (!currentCart) {
        writeToLogFile(
          `Error: Failed to Add Item to Cart with User with ID ${user_id}`
        );
        return success(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.CART_NOT_FOUND
        );
      }

      try {
        if (currentCart.restaurants.toString() !== restaurant._id.toString()) {
          writeToLogFile(
            `Error: Failed to Add Item to Cart with User with ID ${user_id}`
          );
          return failure(
            res,
            HTTP_STATUS.CONFLICT,
            HTTP_RESPONSE.CONFLICT,
            RESPONSE_MESSAGE.CART_RESTAURANT_ERROR
          );
        }
      } catch (err) {
        writeToLogFile(
          `Error: Failed to Add Item to Cart with User with ID ${user_id}`
        );
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.CART_NOT_FOUND
        );
      }

      cart.orderList.map((newItem) => {
        const existingItem = currentCart.orderList.find(
          (item) => item.dishId.toString() === newItem.dishId
        );

        if (existingItem) {
          existingItem.quantity += newItem.quantity;
        } else {
          currentCart.orderList.push(newItem);
        }
      });

      await currentCart.save();

      writeToLogFile(`Add Item to Cart with User with ID ${user_id}`);
      return success(res, HTTP_STATUS.CREATED, HTTP_RESPONSE.OK, currentCart);
    } catch (err) {
      console.log(err);
      writeToLogFile(
        `Error: Failed to Create Cart with User with ID ${user_id} ${err}`
      );
      return failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.FAILED_TO_PROCESS,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }

  async removeItemFromCart(req, res) {
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

      let restaurant;
      try {
        restaurant = await RestaurantModel.findOne({
          _id: cart.restaurant,
        });
      } catch (err) {
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.RESTAURANT_NOT_FOUND
        );
      }

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
        writeToLogFile(
          `Error: Failed to Remove Item to Cart with User with ID ${user_id}`
        );
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.CART_NOT_FOUND
        );
      }

      try {
        if (currentCart.restaurants.toString() !== restaurant._id.toString()) {
          writeToLogFile(
            `Error: Failed to Add Item to Cart with User with ID ${user_id}`
          );
          return failure(
            res,
            HTTP_STATUS.CONFLICT,
            HTTP_RESPONSE.CONFLICT,
            RESPONSE_MESSAGE.CART_RESTAURANT_ERROR
          );
        }
      } catch (err) {
        writeToLogFile(
          `Error: Failed to Add Item to Cart with User with ID ${user_id}`
        );
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.CART_NOT_FOUND
        );
      }

      cart.orderList.map((newItem) => {
        const existingItem = currentCart.orderList.find(
          (item) => item.dishId.toString() === newItem.dishId
        );

        if (existingItem && existingItem.quantity > newItem.quantity) {
          existingItem.quantity -= newItem.quantity;
        } else if (existingItem && existingItem.quantity <= newItem.quantity) {
          currentCart.orderList = currentCart.orderList.filter(
            (deleteItem) => deleteItem.dishId.toString() !== newItem.dishId
          );
          console.log(currentCart.orderList);
        } else {
          writeToLogFile(
            `Error: Remove Item to Cart with User with ID ${user_id}`
          );
          return success(
            res,
            HTTP_STATUS.CONFLICT,
            HTTP_RESPONSE.CONFLICT,
            RESPONSE_MESSAGE.INVALID_DATA
          );
        }
      });

      await currentCart.save();

      writeToLogFile(`Remove Item to Cart with User with ID ${user_id}`);
      return success(res, HTTP_STATUS.CREATED, HTTP_RESPONSE.OK, currentCart);
    } catch (err) {
      console.log(err);
      writeToLogFile(
        `Error: Failed to Remove Cart with User with ID ${user_id} ${err}`
      );
      return failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.FAILED_TO_PROCESS,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }
}

module.exports = new CartController();
