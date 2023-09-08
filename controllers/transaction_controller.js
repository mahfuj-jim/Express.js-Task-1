const TransactionModel = require("../models/transaction_model");
const OrderModel = require("../models/order_model");
const { success, failure, writeToLogFile } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const HTTP_RESPONSE = require("../constants/status_response");
const RESPONSE_MESSAGE = require("../constants/response_message");

class TransactionController {
  async confirmTransaction(req, res) {
    try {
      const { orderId, confirm } = req.query;
      const { transactionMethod, transactionId } = JSON.parse(req.body);

      if (confirm != "true") {
        writeToLogFile(
          `Error: Failed Confirm Transaction with Order ID ${orderId}`
        );
        return failure(
          res,
          HTTP_STATUS.BAD_REQUEST,
          RESPONSE_MESSAGE.FAILED_TO_PROCESS,
          RESPONSE_MESSAGE.INVALID_DATA
        );
      }

      if (
        transactionMethod !== "Cash" &&
        transactionMethod !== "Bkash" &&
        transactionMethod !== "Nagad"
      ) {
        writeToLogFile(`Error: Failed to confirm transaction`);
        return failure(
          res,
          HTTP_STATUS.CONFLICT,
          HTTP_RESPONSE.CONFLICT,
          RESPONSE_MESSAGE.INVALID_TRANSACTION
        );
      }

      const order = await OrderModel.findOne({ _id: orderId });
      if (!order) {
        writeToLogFile(`Error: Failed to confirm transaction`);
        return failure(
          res,
          HTTP_STATUS.NOT_FOUND,
          HTTP_RESPONSE.NOT_FOUND,
          RESPONSE_MESSAGE.ORDER_NOT_FOUND
        );
      }

      if (order.orderStatus != "Reached") {
      }

      const newTransaction = {
        time: new Date(),
        transactionMethod: transactionMethod,
        transactionId: transactionId,
        amount: order.totalPrice,
        orders: order._id,
      };
      const transaction = await TransactionModel.create(newTransaction);
      if (!transaction) {
        writeToLogFile(`Error: Failed to confirm transaction ${err}`);
        failure(
          res,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGE.FAILED_TO_PROCESS,
          HTTP_RESPONSE.INTERNAL_SERVER_ERROR
        );
      }

      writeToLogFile(`Complete transaction with Order ID: ${orderId}`);
      return success(
        res,
        HTTP_STATUS.CREATED,
        HTTP_RESPONSE.CREATED,
        RESPONSE_MESSAGE.TRANSACTION_COMPLETE
      );
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
