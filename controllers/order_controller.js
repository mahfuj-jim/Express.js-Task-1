const OrderModel = require("../models/order_model");
const UserModel = require("../models/user_model");
const { success, failure, writeToLogFile } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const HTTP_RESPONSE = require("../constants/status_response");
const RESPONSE_MESSAGE = require("../constants/response_message");

class OrderController {
    async createOrder(req, res) {
        try {
            const { userId } = req.params;

            UserModel.findOne({ _id: userId }).then(async (user) => {
                writeToLogFile(`Create a order for User with ID ${userId}`);
                return success(res, HTTP_STATUS.CREATED, HTTP_RESPONSE.OK, user);
             }).catch((err) => {
                writeToLogFile(`Error: Create a Order for User with ID ${userId} ${err}`);
                return failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.SIGNUP_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
             });
        } catch (err) {
            console.log(err);
            writeToLogFile(`Error: Failed to Create Order for User${err}`);
            failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.LOGIN_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = new OrderController();