const OrderController = require("../controllers/order_controller");
const { validateToken, validateOrderCreateToken } = require("../middleware/token_validation");
const express = require("express");
const router = express.Router();

router.post("/create/:userId", validateToken, validateOrderCreateToken, OrderController.createOrder);

module.exports = router;