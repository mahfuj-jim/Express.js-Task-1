const { failure } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const RESPONSE_MESSAGE = require("../constants/response_message");

const validateDish = (req, res, next) => {
    const { dishName, price } = JSON.parse(req.body);
    const errors = {};

    if (!dishName || typeof dishName !== "string" || dishName.trim() === "") {
        errors.dishName = "Dish name is required";
    }

    if (!price || typeof price !== "number" || price <= 0) {
        errors.price = "Valid Price is required";
    }

    if (Object.keys(errors).length > 0) {
        return failure(res, HTTP_STATUS.BAD_REQUEST, RESPONSE_MESSAGE.INVALID_DATA, errors);
    }

    next();
};

module.exports = {
    validateDish,
};
