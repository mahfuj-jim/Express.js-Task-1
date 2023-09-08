const { failure } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const RESPONSE_MESSAGE = require("../constants/response_message");

const validateConfirmOrderByRestaurant = (req, res, next) => {
    const { orderId, confirm } = req.query;
    const errors = {};

    if(!orderId || orderId === ""){
        errors.orderId = "Order Id is Require";
    }

    if(!confirm || confirm != "true"){
        errors.confirm = "Valid Confirmation is Require";
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
};

module.exports = { validateConfirmOrderByRestaurant };
