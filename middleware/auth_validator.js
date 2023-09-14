const { failure } = require("../util/common.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const RESPONSE_MESSAGE = require("../constants/response_message");

const validateSignup = (req, res, next) => {
    const { email, password, role } = JSON.parse(req.body);
    const errors = {};

    if (!role || ![1, 2, 3].includes(role)) {
        errors.role = "Invalid Role";
    }

    if (!email || email === "") {
        errors.email = "Email is require";
    } else if (!email.includes("@")) {
        errors.email = "Invalid Email";
    }

    if (!password || password === "") {
        errors.password = "Password is require";
    } else if (
        !/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/.test(
            password
        )
    ) {
        errors.password =
            "Password must be at least 8 characters long and include at least one capital letter, one small letter, one special character, and one number.";
    }

    if (Object.keys(errors).length > 0) {
        return failure(res, HTTP_STATUS.BAD_REQUEST, RESPONSE_MESSAGE.SIGNUP_FAILED, errors);
    }

    next();
}

const validateLogin = (req, res, next) => {
    const { email, password } = JSON.parse(req.body);
    const errors = {};

    if (!email || email === "") {
        errors.email = "Email is require";
    } else if (!email.includes("@")) {
        errors.email = "Invalid Credential";
    }

    if (!password || password === "" || password.trim().length < 8) {
        errors.password = "Invalid Credential";
    }

    if (Object.keys(errors).length > 0) {
        return failure(res, HTTP_STATUS.BAD_REQUEST, RESPONSE_MESSAGE.LOGIN_FAILED, errors);
    }

    next();
};

module.exports = {
    validateSignup,
    validateLogin,
};
