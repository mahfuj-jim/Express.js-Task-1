const UserModel = require("../models/user_model");
const RestaurantModel = require("../models/restaurant_model");
const { success, failure, writeToLogFile } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const HTTP_RESPONSE = require("../constants/status_response");
const RESPONSE_MESSAGE = require("../constants/response_message");
const mongoose = require("mongoose");

class UserController {
  async getAllUserData(req, res) {
    try {
      await UserModel.find({})
        .then((users) => {
          writeToLogFile("Get ALl Users");
          return success(res, HTTP_STATUS.OK, HTTP_RESPONSE.OK, users);
        })
        .catch((err) => {
          writeToLogFile(`Error: Get All Users ${err}`);
          return failure(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            RESPONSE_MESSAGE.SIGNUP_FAILED,
            HTTP_RESPONSE.INTERNAL_SERVER_ERROR
          );
        });
    } catch (err) {
      writeToLogFile(`Error: Get All Users ${err}`);
      return failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.SIGNUP_FAILED,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUserById(req, res) {
    try {
      const { user_id } = req.params;
      UserModel.findOne({ _id: user_id })
        .then((user) => {
          writeToLogFile(`Get User with ID ${user_id}`);
          return success(res, HTTP_STATUS.OK, HTTP_RESPONSE.OK, user);
        })
        .catch((err) => {
          writeToLogFile(`Error: Get User with ID ${user_id} ${err}`);
          return failure(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            RESPONSE_MESSAGE.SIGNUP_FAILED,
            HTTP_RESPONSE.INTERNAL_SERVER_ERROR
          );
        });
    } catch (err) {
      writeToLogFile(`Error: Get User with ID ${user_id} ${err}`);
      return failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.SIGNUP_FAILED,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }
}

module.exports = new UserController();
