const RestaurantModel = require("../models/restaurant_model");
const { success, failure, writeToLogFile } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const HTTP_RESPONSE = require("../constants/status_response");
const RESPONSE_MESSAGE = require("../constants/response_message");
const mongoose = require("mongoose");

class RestaurantController {
  async getAllRestaurantData(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filterOption = req.query.filterOption;
      const filter = req.query.filter;
      let query = {};

      if (page < 1 || limit < 0) {
        return failure(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          HTTP_RESPONSE.UNPROCESSABLE_ENTITY,
          RESPONSE_MESSAGE.INVALID_DATA
        );
      }

      if (!filterOption) {
        console.log("Filter Options");
      }
      if (!filter) {
        console.log("Filter");
      }

      if ((filterOption && !filter) || (!filterOption && filter)) {
        return failure(
          res,
          HTTP_STATUS.BAD_REQUEST,
          HTTP_RESPONSE.BAD_REQUEST,
          RESPONSE_MESSAGE.INVALID_FILTER_OPTION
        );
      }

      switch (filterOption) {
        case "cuisine":
          query.cuisine = { $regex: filter, $options: "i" };
          break;
        case "location":
          query.location = { $regex: filter, $options: "i" };
          break;
        default:
          return failure(
            res,
            HTTP_STATUS.BAD_REQUEST,
            HTTP_RESPONSE.BAD_REQUEST,
            RESPONSE_MESSAGE.INVALID_FILTER_OPTION
          );
      }

      const restaurants = await RestaurantModel.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      if (!restaurants) {
        writeToLogFile(`Error: Get All Restaurants ${err}`);
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.RESTAURANT_NOT_FOUND
        );
      }

      writeToLogFile("Get ALl Restaurants");
      return success(res, HTTP_STATUS.OK, HTTP_RESPONSE.OK, {
        totalRestaurant: restaurants.length,
        page: page,
        restaurantPerPage: limit,
        restaurants: restaurants,
      });
    } catch (err) {
      writeToLogFile(`Error: Get All Restaurants ${err}`);
      return failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.RESTAURANT_NOT_FOUND,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getRestaurantById(req, res) {
    try {
      const { restaurantId } = req.params;
      RestaurantModel.findOne({ _id: restaurantId })
        .then((restaurant) => {
          writeToLogFile(`Get Restaurant with ID ${restaurantId}`);
          return success(res, HTTP_STATUS.OK, HTTP_RESPONSE.OK, restaurant);
        })
        .catch((err) => {
          writeToLogFile(
            `Error: Get Restaurant with ID ${restaurantId} ${err}`
          );
          return failure(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            RESPONSE_MESSAGE.SIGNUP_FAILED,
            HTTP_RESPONSE.INTERNAL_SERVER_ERROR
          );
        });
    } catch (err) {
      writeToLogFile(`Error: Get Restaurant with ID ${restaurantId} ${err}`);
      return failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.SIGNUP_FAILED,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createMenuItem(req, res) {
    try {
      const { restaurantId } = req.params;
      const { dishName, price } = JSON.parse(req.body);

      RestaurantModel.findOne({ _id: restaurantId })
        .then(async (restaurant) => {
          const menuItem = {
            _id: new mongoose.Types.ObjectId(),
            dishName: dishName,
            price: price,
          };

          restaurant.menu.push(menuItem);
          await restaurant.save();

          writeToLogFile(
            `Create a menu for Restaurant with ID ${restaurantId}`
          );
          return success(res, HTTP_STATUS.CREATED, HTTP_RESPONSE.OK, menuItem);
        })
        .catch((err) => {
          writeToLogFile(
            `Error: Create Restaurant Menu with ID ${restaurantId} ${err}`
          );
          return failure(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            RESPONSE_MESSAGE.SIGNUP_FAILED,
            HTTP_RESPONSE.INTERNAL_SERVER_ERROR
          );
        });
    } catch (err) {
      console.log(err);
      writeToLogFile(`Error: Create Menu for Restaurant ${err}`);
      failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.LOGIN_FAILED,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getRestaurantMenu(req, res) {
    try {
      const { restaurantId } = req.params;
      RestaurantModel.findOne({ _id: restaurantId })
        .then((restaurant) => {
          writeToLogFile(`Get menu for Restaurant with ID ${restaurantId}`);
          return success(
            res,
            HTTP_STATUS.OK,
            HTTP_RESPONSE.OK,
            restaurant.menu
          );
        })
        .catch((err) => {
          writeToLogFile(
            `Error: Get menu for Restaurant with ID ${restaurantId} ${err}`
          );
          return failure(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            RESPONSE_MESSAGE.SIGNUP_FAILED,
            HTTP_RESPONSE.INTERNAL_SERVER_ERROR
          );
        });
    } catch (err) {
      writeToLogFile(
        `Error: Get menu for Restaurant with ID ${restaurantId} ${err}`
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

module.exports = new RestaurantController();
