const OrderController = require("../controllers/order_controller");
const {
  validateToken,
  validateAdminToken,
  validateOrderCreateToken,
  validateOrderConfirmByRestaurantToken,
  validateOrderReachByRiderToken,
} = require("../middleware/token_validation");
const {validateConfirmOrderByRestaurant} = require("../middleware/order_validator");
const express = require("express");
const router = express.Router();

router.get("/all", validateToken, validateAdminToken, OrderController.getAllOrder);
router.post("/create/:userId", validateToken, validateOrderCreateToken, OrderController.createOrder);
router.post("/confirm", validateConfirmOrderByRestaurant, validateToken, validateOrderConfirmByRestaurantToken, OrderController.confirmOrderByRestaurant);
router.post("/ready", validateConfirmOrderByRestaurant, validateToken, validateOrderConfirmByRestaurantToken, OrderController.handoverOrderByRestaurant);
router.post("/destination", validateConfirmOrderByRestaurant, validateToken, validateOrderReachByRiderToken, OrderController.reachOrderByRider);

module.exports = router;
