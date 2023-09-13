const RestaurantModel = require("../models/restaurant_model");
const RiderModel = require("../models/rider_model");
const OrderModel = require("../models/order_model");
const ReviewModel = require("../models/review_model");
const { success, failure, writeToLogFile } = require("../util/common.js");
const { decodeToken } = require("../util/token_generator");
const HTTP_STATUS = require("../constants/status_codes.js");
const HTTP_RESPONSE = require("../constants/status_response");
const RESPONSE_MESSAGE = require("../constants/response_message");
const mongoose = require("mongoose");

class ReviewController {
  async getRestaurantReview(req, res) {
    try {
      const { restaurantId } = JSON.parse(req.body);

      const restaurantReviews = await ReviewModel.find({
        restaurants: restaurantId,
      }, {restaurants: false})
        .populate("users", "name email phoneNumber")
        .exec();

      if(!restaurantReviews){
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.FAILED_TO_GET_REVIEW,
        );
      }

      writeToLogFile(`Get review for Restaurant with ID ${restaurantId}`);
      return success(res, HTTP_STATUS.OK, HTTP_RESPONSE.OK, restaurantReviews);
    } catch (err) {
      console.log(err);
      writeToLogFile(`Error: Get review for Restaurant ${err}`);
      return failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.FAILED_TO_GET_REVIEW,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }

  async addRestaurantReview(req, res) {
    try {
      const { orderId, comment, rating } = JSON.parse(req.body);
      let totalReview = 0;

      const validOrderId = mongoose.Types.ObjectId.isValid(orderId);
      if (!validOrderId) {
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

      const order = await OrderModel.findOne({ _id: orderId }).exec();
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

      const token = decodeToken(req);
      if (token.user._id !== order.users.toString()) {
        return failure(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          HTTP_RESPONSE.UNAUTHORIZED,
          RESPONSE_MESSAGE.UNAUTHORIZED
        );
      }

      const restaurantReviews = await ReviewModel.find({
        restaurants: order.restaurants,
      });
      restaurantReviews.map((review) => {
        totalReview += review.rating;
      });

      let restaurant = await RestaurantModel.findOne({
        _id: order.restaurants,
      }).exec();
      restaurant.rating =
        (totalReview + rating) / (restaurantReviews.length + 1);

      const newReview = {
        users: order.users,
        restaurants: order.restaurants,
        comment: comment,
        rating: rating,
        time: new Date(),
      };

      let existingReview = await ReviewModel.findOne({
        users: order.users,
        restaurants: order.restaurants,
      });
      if (existingReview) {
        existingReview.comment = comment;
        existingReview.rating = rating;

        await existingReview.save();
        await restaurant.save();

        writeToLogFile(`Add review for Restaurant`);
        return success(
          res,
          HTTP_STATUS.OK,
          HTTP_RESPONSE.OK,
          RESPONSE_MESSAGE.REVIEW_ADDED
        );
      }

      await restaurant.save();
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

  async getRiderReview(req, res) {
    try {
      const { riderId } = JSON.parse(req.body);

      const riderReviews = await ReviewModel.find({
        riders: riderId,
      }, {riders: false})
        .populate("users", "name email phoneNumber")
        .exec();

      if(!riderReviews){
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.FAILED_TO_GET_REVIEW,
        );
      }

      writeToLogFile(`Get review for Rider with ID ${riderId}`);
      return success(res, HTTP_STATUS.OK, HTTP_RESPONSE.OK, riderReviews);
    } catch (err) {
      console.log(err);
      writeToLogFile(`Error: Get review for Rider ${err}`);
      return failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.FAILED_TO_GET_REVIEW,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }

  async addRiderReview(req, res) {
    try {
      const { orderId, comment, rating } = JSON.parse(req.body);
      let totalReview = 0;

      const validOrderId = mongoose.Types.ObjectId.isValid(orderId);
      if (!validOrderId) {
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

      const order = await OrderModel.findOne({ _id: orderId }).exec();
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

      const token = decodeToken(req);
      if (token.user._id !== order.users.toString()) {
        return failure(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          HTTP_RESPONSE.UNAUTHORIZED,
          RESPONSE_MESSAGE.UNAUTHORIZED
        );
      }

      const riderReview = await ReviewModel.find({ riders: order.riders });
      riderReview.map((review) => {
        totalReview += review.rating;
      });

      let rider = await RiderModel.findOne({ _id: order.riders }).exec();
      rider.rating = (totalReview + rating) / (riderReview.length + 1);

      const newReview = {
        users: order.users,
        riders: order.riders,
        comment: comment,
        rating: rating,
        time: new Date(),
      };

      let existingReview = await ReviewModel.findOne({
        users: order.users,
        riders: order.riders,
      });
      if (existingReview) {
        existingReview.comment = comment;
        existingReview.rating = rating;
        existingReview.time = new Date();

        await existingReview.save();
        await rider.save();

        writeToLogFile(`Add review for Restaurant`);
        return success(
          res,
          HTTP_STATUS.OK,
          HTTP_RESPONSE.OK,
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

      await rider.save();
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

module.exports = new ReviewController();
