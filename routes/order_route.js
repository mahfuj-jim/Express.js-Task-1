const OrderController = require("../controllers/order_controller.js");
const {validateNewOrderData} = require("../middleware/validator.js");
const {authenticateUser} = require("../middleware/user_validator.js");
const {authenticateRestaurant} = require("../middleware/restaurant_validator.js");
const express = require("express");
const routes = express.Router();

routes.get("/all", OrderController.getAllOrderData);
routes.get("/all/:orderId", OrderController.getOrderById);
// routes.get("/", OrderController.getOrderById);
routes.get("/restaurant", authenticateRestaurant, OrderController.getOrderByRestaurantId);
// routes.get("/user",  authenticateUser, OrderController.getOrderByUserID);
// routes.patch("/status", OrderController.completeOrder);
routes.post("/create", authenticateUser, validateNewOrderData, OrderController.createOrder);

module.exports = routes;