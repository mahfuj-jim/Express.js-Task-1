const RestaurantModel = require("../models/restaurant_model");
const OrderModel = require("../models/order_model");
const ReviewModel = require("../models/review_model");
const { success, failure, writeToLogFile } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const HTTP_RESPONSE = require("../constants/status_response");
const RESPONSE_MESSAGE = require("../constants/response_message");
const mongoose = require("mongoose");

class RestaurantController {
  async getAllRestaurantData(req, res) {
    try {
      const {
        filterOption,
        filter,
        sortOption,
        sort,
        search,
        menuPrice,
        priceComparison,
        menuSort,
      } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      let query = {};
      let sortObj = {};

      if (filterOption && filter) {
        switch (filterOption) {
          case "cuisine":
            const cuisines = filter.split(",").map((cuisine) => cuisine.trim());
            const cuisineRegex = cuisines.map(
              (cuisine) => new RegExp(cuisine, "i")
            );
            query.cuisine = { $in: cuisineRegex };
            break;
          case "location":
            const locations = filter
              .split(",")
              .map((location) => location.trim());
            const locationRegex = locations.map(
              (location) => new RegExp(location, "i")
            );
            query.location = { $in: locationRegex };
            break;
          case "menu":
            const menus = filter.split(",").map((menu) => menu.trim());
            const menuRegex = menus.map((menu) => new RegExp(menu, "i"));
            query["menu.dishName"] = { $in: menuRegex };
            break;
          default:
            return failure(
              res,
              HTTP_STATUS.BAD_REQUEST,
              HTTP_RESPONSE.BAD_REQUEST,
              RESPONSE_MESSAGE.INVALID_FILTER_OPTION
            );
        }
      }

      if (sortOption && sort) {
        switch (sortOption) {
          case "deliveryFee":
            sortObj["deliveryOptions.deliveryFee"] =
              sort === "asc" ? 1 : sort === "desc" ? -1 : 1;
            break;
          default:
            return failure(
              res,
              HTTP_STATUS.BAD_REQUEST,
              HTTP_RESPONSE.BAD_REQUEST,
              RESPONSE_MESSAGE.INVALID_SORTING_OPTION
            );
        }
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { "deliveryOptions.deliveryArea": { $regex: search, $options: "i" } },
          { cuisine: { $regex: search, $options: "i" } },
          { "menu.dishName": { $regex: search, $options: "i" } },
        ];
      }

      const restaurants = await RestaurantModel.find(query)
        .sort(sortObj)
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

      if (menuPrice && priceComparison) {
        restaurants.forEach((restaurant) => {
          restaurant.menu = restaurant.menu.filter((item) => {
            switch (priceComparison) {
              case "greater":
                return item.price >= menuPrice;
              case "less":
                return item.price <= menuPrice;
              default:
                return false;
            }
          });
        });
      }

      if (menuSort && menuSort === "asc") {
        restaurants.forEach((restaurant) => {
          restaurant.menu.sort((a, b) => a.price - b.price);
        });
      } else if (menuSort && menuSort === "desc") {
        restaurants.forEach((restaurant) => {
          restaurant.menu.sort((a, b) => b.price - a.price);
        });
      }

      if (restaurants.length === 0) {
        return success(
          res,
          HTTP_STATUS.OK,
          RESPONSE_MESSAGE.NO_RESTAURANT_FOUND,
          {
            totalRestaurant: restaurants.length,
            page: page,
            restaurantPerPage: limit,
            restaurants: restaurants,
          }
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
          return success(res, HTTP_STATUS.OK, HTTP_RESPONSE.OK, {
            totlaItem: restaurant.menu.length,
            menu: restaurant.menu,
          });
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

  async addRestaurantReview(req, res) {
    try {
      const { orderId, comment, rating } = JSON.parse(req.body);

      const order = await OrderModel.findOne({ _id: orderId });
      if (!order) {
        writeToLogFile(
          `Error: Add review for Restaurant with Order ID ${orderId} `
        );
        failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.ORDER_NOT_FOUND
        );
      }

      if (order.orderStatus !== "Delivered") {
        writeToLogFile(
          `Error: Add review for Restaurant with Order ID ${orderId} `
        );
        return failure(
          res,
          HTTP_STATUS.BAD_REQUEST,
          RESPONSE_MESSAGE.FAILED_TO_PROCESS,
          RESPONSE_MESSAGE.INVALID_REQUEST
        );
      }

      const newReview = {
        users: order.users,
        restaurants: order.restaurants,
        comment: comment,
        rating: rating,
        time: new Date(),
      };

      let existingReview = await ReviewModel.findOne({users: order.users, restaurants: order.restaurants});
      if (existingReview) {
        existingReview.comment = comment;
        existingReview.rating = rating;
        await existingReview.save();

        writeToLogFile(`Add review for Restaurant`);
        return success(
          res,
          HTTP_STATUS.CREATED,
          HTTP_RESPONSE.CREATED,
          RESPONSE_MESSAGE.REVIEW_ADDED
        );
      }

      const createdReview = await ReviewModel.create(newReview);
      if (!createdReview) {
        writeToLogFile(
          `Error: Add review for Restaurant with Order ID ${orderId}}`
        );
        return failure(
          res,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGE.SIGNUP_FAILED,
          HTTP_RESPONSE.INTERNAL_SERVER_ERROR
        );
      }

      writeToLogFile(`Add review for Restaurant`);
      return success(
        res,
        HTTP_STATUS.CREATED,
        HTTP_RESPONSE.CREATED,
        RESPONSE_MESSAGE.REVIEW_ADDED
      );
    } catch (err) {
      console.log(err);
      writeToLogFile(`Error: Add review for Restaurant ${err}`);
      return failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.FAILED_REVIEW,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }
}

module.exports = new RestaurantController();
