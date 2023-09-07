const AuthModel = require("../models/auth_model");
const UserModel = require("../models/user_model");
const RestaurantModel = require("../models/restaurant_model");
const RiderModel = require("../models/rider_model");
const { success, failure, writeToLogFile } = require("../util/common.js");
const { generateUserToken, generateRestaurantToken, generateRiderToken } = require("../util/token_generator.js");
const HTTP_STATUS = require("../constants/status_codes.js");
const HTTP_RESPONSE = require("../constants/status_response");
const RESPONSE_MESSAGE = require("../constants/response_message");
const bcrypt = require("bcrypt");

class AuthController {
    async signup(req, res) {
        try {
            const response = JSON.parse(req.body);
            const { email, password, role } = response;
            let id, token;

            const isEmailExists = await AuthModel.findOne({ email });
            if (isEmailExists) {
                writeToLogFile(`Error: Failed to Signup Email: ${email} already exists`);
                return failure(res, HTTP_STATUS.CONFLICT, RESPONSE_MESSAGE.SIGNUP_FAILED, RESPONSE_MESSAGE.EMAIL_EXIST);
            }

            const newInstance = response;
            delete newInstance.role;
            delete newInstance.password;

            if (role === 1) {
                await UserModel.create(newInstance)
                    .then(async (createdUser) => {
                        id = createdUser._id;
                        token = await generateUserToken(createdUser);
                    })
                    .catch((error) => {
                        console.log(error);
                        writeToLogFile(`Error: Failed to Signup USER ${error}`);
                        return failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.SIGNUP_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
                    });
            } else if (role === 2) {
                await RestaurantModel.create(newInstance)
                    .then(async (createdRestaurant) => {
                        id = createdRestaurant._id;
                        token = await generateRestaurantToken(createdRestaurant);
                    })
                    .catch((error) => {
                        console.log(error);
                        writeToLogFile(`Error: Failed to Signup RESTAURANT ${error}`);
                        return failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.SIGNUP_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
                    });
            } else if (role === 3) {
                await RiderModel.create(newInstance)
                    .then(async (createdRider) => {
                        id = createdRider._id;
                        token = await generateRestaurantToken(createdRider);
                    })
                    .catch((error) => {
                        console.log(error);
                        writeToLogFile(`Error: Failed to Signup RIDER ${error}`);
                        return failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.SIGNUP_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
                    });
            } else {
                return failure(res, HTTP_STATUS.NOT_FOUND, RESPONSE_MESSAGE.SIGNUP_FAILED, RESPONSE_MESSAGE.INVALID_USER);
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newAuth = {
                email: email,
                password: hashedPassword,
                verified: false,
                role: role,
                user: role === 1 ? id : null,
                restaurant: role === 2 ? id : null,
                rider: role === 3 ? id : null,
            };

            await AuthModel.create(newAuth)
                .then((auth) => {
                    writeToLogFile(`Auth: Successfully Signup Role: ${role} and ID: ${id}`);
                    return success(res, HTTP_STATUS.CREATED, RESPONSE_MESSAGE.SIGNUP_SUCCESS, {
                        token,
                        data: { id: id, ...newInstance },
                    });
                })
                .catch((err) => {
                    console.log(err);
                    writeToLogFile(`Error: Failed to Signup ${err}`);
                    return failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.SIGNUP_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
                });
        } catch (err) {
            console.log(err);
            writeToLogFile(`Error: Failed to Signup ${err}`);
            return failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.SIGNUP_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
        }
    }

    async login(req, res) {
        try {
            const { email, password } = JSON.parse(req.body);
            let responseData, token;

            const auth = await AuthModel.findOne({ email }).populate("user").populate("restaurant").populate("rider").exec();
            if (!auth) {
                writeToLogFile(`Error: Failed to Login User with Email: ${email} Doesn't Exists`);
                return failure(res, HTTP_STATUS.NOT_FOUND, RESPONSE_MESSAGE.LOGIN_FAILED, RESPONSE_MESSAGE.EMAIL_DOESNT_EXIST);
            }

            if (auth.blockUntil && auth.blockUntil > new Date()) {
                const remainingTimeInSeconds = Math.ceil(
                    (auth.blockUntil - new Date()) / 1000
                );
                writeToLogFile(`Error: Failed to Login With Email: ${email}. ID is Blocked Untill ${auth.blockUntil}`);
                return failure(res, HTTP_STATUS.UNAUTHORIZED, RESPONSE_MESSAGE.LOGIN_FAILED, `Account is blocked. Try again in ${remainingTimeInSeconds} seconds.`);
            }

            const isPasswordValid = await bcrypt.compare(password, auth.password);
            if (!isPasswordValid) {
                auth.loginAttempts = (auth.loginAttempts || 0) + 1;

                if (auth.loginAttempts >= 5) {
                    const blockUntil = new Date(Date.now() + 5 * 60 * 1000);
                    auth.blockUntil = blockUntil;
                    auth.loginAttempts = 0;

                    await auth.save();
                    writeToLogFile(`Error: Failed to Login With Email: ${email}. ID is Blocked Untill ${blockUntil}`);
                    return failure(res, HTTP_STATUS.UNAUTHORIZED, RESPONSE_MESSAGE.LOGIN_FAILED, RESPONSE_MESSAGE.BLOCK_ACCOUNT);
                }

                await auth.save();
                writeToLogFile(`Error: Failed to Login With Email: ${email}. Invalid Password`);
                return failure(res, HTTP_STATUS.UNAUTHORIZED, RESPONSE_MESSAGE.LOGIN_FAILED, RESPONSE_MESSAGE.INVALID_CREDENTIAL);
            }

            if (auth.role === 1) {
                token = await generateUserToken(auth.user);
                responseData = auth.user;
            } else if (auth.role === 2) {
                token = await generateRestaurantToken(auth.restaurant);
                responseData = auth.restaurant;
            } else if (auth.role === 3) {
                token = await generateRiderToken(auth.rider);
                responseData = auth.rider;
            }

            auth.loginAttempts = 0;
            writeToLogFile(`Auth: Successfully Login Role: ${auth.role} and ID: ${auth._id}`);
            return success(res, HTTP_STATUS.OK, RESPONSE_MESSAGE.LOGIN_SUCCESS, { token: token, data: responseData });
        } catch (err) {
            console.log(err);
            writeToLogFile(`Error: Failed to Login ${err}`);
            failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.LOGIN_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = new AuthController();