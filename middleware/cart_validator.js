const { failure } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const RESPONSE_MESSAGE = require("../constants/response_message.js");

function validateCart(req, res, next) {
  const { restaurant, orderList } = JSON.parse(req.body);

  const errors = {};

  if (!restaurant || restaurant === "") {
    errors.restaurant = "Restaurant is required.";
  }

  if (!orderList || !Array.isArray(orderList) || orderList.length === 0) {
    errors.orderList = "OrderList cannot be empty.";
  } else {
    orderList.map((item, index) => {
      if (!item.dishId || item.dishId === "") {
        errors.dishId = "DishId is required.";
      }

      if (!item.quantity || item.quantity <= 0) {
        errors.quantity = "Quantity must be greater than 0.";
      }
    });
  }

  if (Object.keys(errors).length > 0) {
    return failure(
      res,
      HTTP_STATUS.BAD_REQUEST,
      RESPONSE_MESSAGE.INVALID_DATA,
      errors
    );
  }

  next();
}

module.exports = {
  validateCart,
};
