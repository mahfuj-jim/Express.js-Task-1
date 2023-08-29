const OrderController = require("../controllers/order_controller.js");
const express = require("express");
const routes = express.Router();

routes.get("/all", OrderController.getAllOrderData);
routes.get("/", OrderController.getOrderById);
routes.put("/status", OrderController.completeOrder);
routes.post("/create", OrderController.createOrder);

module.exports = routes;