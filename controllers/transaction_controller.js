const TransactionModel = require("../models/transaction_model");
const OrderModel = require("../models/order_model");
const UserModel = require("../models/user_model");
const { success, failure, writeToLogFile } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const HTTP_RESPONSE = require("../constants/status_response");
const RESPONSE_MESSAGE = require("../constants/response_message");

class TransactionController {
  async confirmTransaction(req, res) {
    try {
      const { orderId, confirm } = req.query;
      
      writeToLogFile(`Complete transaction with Order ID: ${orderId}`);
      return success(res, HTTP_STATUS.CREATED, HTTP_RESPONSE.CREATED, RESPONSE_MESSAGE.TRANSACTION_COMPLETE);
    } catch (err) {
      console.log(err);
      writeToLogFile(`Error: Failed to confirm transaction ${err}`);
      failure(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.FAILED_TO_PROCESS,
        HTTP_RESPONSE.INTERNAL_SERVER_ERROR
      );
    }
  }
}

module.exports = new TransactionController();
