const OrderController = require("../controllers/order_controller.js");
const {validateNewOrderData} = require("../middleware/validator.js");
const express = require("express");
const routes = express.Router();

routes.get("/all", OrderController.getAllOrderData);
routes.get("/", OrderController.getOrderById);
routes.patch("/status", OrderController.completeOrder);
routes.post("/create", validateNewOrderData, OrderController.createOrder);

module.exports = routes;