const HTTP_STATUS = require("../constants/status_codes.js");
const HTTP_RESPONSE = require("../constants/status_response.js");
const RESPONSE_MESSAGE = require("../constants/response_message");
const { failure } = require("../util/common.js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

function validateToken(req, res, next) {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);

    try {
        const verifyToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (verifyToken) {
            next();
        } else {
            throw new Error();
        }
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.TOKEN_EXPIRE);
        }
        if (err instanceof jwt.JsonWebTokenError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
        }
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }
}

function validateAdminToken(req, res, next) {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);

    try {
        const verifyToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (verifyToken) {
            if (verifyToken.role === "admin") {
                next();
            } else {
                return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
            }
        } else {
            throw new Error();
        }
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.TOKEN_EXPIRE);
        }
        if (err instanceof jwt.JsonWebTokenError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
        }
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }
}

function validateSuperAdminToken(req, res, next) {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);

    try {
        const verifyToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (verifyToken) {
            if (verifyToken.role === "admin" && verifyToken.admin.superAdmin) {
                next();
            } else {
                return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
            }
        } else {
            throw new Error();
        }
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.TOKEN_EXPIRE);
        }
        if (err instanceof jwt.JsonWebTokenError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
        }
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }
}

function validateRestaurantToken(req, res, next) {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);

    try {
        const verifyToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (verifyToken) {
            if (verifyToken.role === "restaurant" || verifyToken.role === "admin") {
                next();
            } else {
                return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
            }
        } else {
            throw new Error();
        }
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.TOKEN_EXPIRE);
        }
        if (err instanceof jwt.JsonWebTokenError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
        }
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }
}

function validateUserToken(req, res, next) {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);

    try {
        const verifyToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (verifyToken) {
            if (verifyToken.role === "user" || verifyToken.role === "admin") {
                next();
            } else {
                return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
            }
        } else {
            throw new Error();
        }
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.TOKEN_EXPIRE);
        }
        if (err instanceof jwt.JsonWebTokenError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
        }
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }
}

function validateRestaurantViewToken(req, res, next) {
    const authHeader = req.header("Authorization");
    const { restaurantId } = req.params;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);

    try {
        const verifyToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (verifyToken) {
            if (verifyToken.role === "user" || verifyToken.role === "admin") {
                next();
            } else if (verifyToken.role === "restaurant" && verifyToken.restaurant._id === restaurantId) {
                next();
            } else {
                return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
            }
        } else {
            throw new Error();
        }
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.TOKEN_EXPIRE);
        }
        if (err instanceof jwt.JsonWebTokenError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
        }
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }
}

function validateRestaurantModiyToken(req, res, next) {
    const authHeader = req.header("Authorization");
    const { restaurantId } = req.params;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);

    try {
        const verifyToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (verifyToken) {
            if (verifyToken.role === "admin") {
                next();
            } else if (verifyToken.role === "restaurant" && verifyToken.restaurant._id === restaurantId) {
                next();
            } else {
                return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
            }
        } else {
            throw new Error();
        }
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.TOKEN_EXPIRE);
        }
        if (err instanceof jwt.JsonWebTokenError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
        }
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }
}

function validateOrderCreateToken(req, res, next) {
    const authHeader = req.header("Authorization");
    const { userId } = req.params;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);

    try {
        const verifyToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (verifyToken) {
            if (verifyToken.role === "admin") {
                next();
            } else if (verifyToken.role === "user" && verifyToken.user._id === userId) {
                next();
            } else {
                return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
            }
        } else {
            throw new Error();
        }
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.TOKEN_EXPIRE);
        }
        if (err instanceof jwt.JsonWebTokenError) {
            return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
        }
        return failure(res, HTTP_STATUS.UNAUTHORIZED, HTTP_RESPONSE.UNAUTHORIZED, RESPONSE_MESSAGE.UNAUTHORIZED);
    }
}

module.exports = {
    validateToken,
    validateAdminToken,
    validateSuperAdminToken,
    validateRestaurantToken,
    validateUserToken,
    validateRestaurantViewToken,
    validateRestaurantModiyToken,
    validateOrderCreateToken
};