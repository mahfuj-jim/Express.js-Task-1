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
            await UserModel.find({}).then((users) => {
                writeToLogFile("Get ALl Users");
                return success(res, HTTP_STATUS.OK, HTTP_RESPONSE.OK, users);
            }).catch((err) => {
                writeToLogFile(`Error: Get All Users ${err}`);
                return failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.SIGNUP_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
            });
        } catch (err) {
            writeToLogFile(`Error: Get All Users ${err}`);
            return failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.SIGNUP_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
        }
    }

    async getUserById(req, res) {
        try {
            const { user_id } = req.params;
            UserModel.findOne({ _id: user_id }).then((user) => {
                writeToLogFile(`Get User with ID ${user_id}`);
                return success(res, HTTP_STATUS.OK, HTTP_RESPONSE.OK, user);
            }).catch((err) => {
                writeToLogFile(`Error: Get User with ID ${user_id} ${err}`);
                return failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.SIGNUP_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
            });
        } catch (err) {
            writeToLogFile(`Error: Get User with ID ${user_id} ${err}`);
            return failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.SIGNUP_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
        }
    }

    async addToCart(req, res) {
        try {
            const { user_id } = req.params;
            const cart = JSON.parse(req.body);
            let orderList = [];

            const user = await UserModel.findOne({ _id: user_id });

            if (!user) {
                return failure(res, HTTP_STATUS.NOT_FOUND, HTTP_RESPONSE.NOT_FOUND, RESPONSE_MESSAGE.USER_NOT_FOUND);
            }

            const restaurant = await RestaurantModel.findOne({ _id: cart.restaurant });

            if (!restaurant) {
                return failure(res, HTTP_STATUS.NOT_FOUND, HTTP_RESPONSE.NOT_FOUND, RESPONSE_MESSAGE.RESTAURANT_NOT_FOUND);
            }

            cart.orderList.map(orderItem => {
                restaurant.menu.map(item => {
                    if (orderItem.dishId === item._id.toString()) {
                        orderList.push({ dishName: item.dishName, price: item.price, quantity: orderItem.quantity });
                    }
                });
            });

            cart.orderList = orderList;
            user.cart = cart;
            await user.save();

            writeToLogFile(`Create Cart with User with ID ${user_id}`);
            return success(res, HTTP_STATUS.OK, HTTP_RESPONSE.OK, user.cart);
        } catch (err) {
            console.log(err);
            writeToLogFile(`Error: Failed to Create Cart with User with ID ${user_id} ${err}`);
            return failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.SIGNUP_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = new UserController();