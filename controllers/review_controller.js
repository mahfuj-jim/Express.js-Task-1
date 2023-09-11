const OrderModel = require("../models/order_model");
const ReviewModel = require("../models/review_model");
const { success, failure, writeToLogFile } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const HTTP_RESPONSE = require("../constants/status_response");
const RESPONSE_MESSAGE = require("../constants/response_message");
const mongoose = require("mongoose");

class ReviewController {
  async addRestaurantReview(req, res) {
    try {
      const { orderId, comment, rating } = JSON.parse(req.body);

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

module.exports = new ReviewController();
