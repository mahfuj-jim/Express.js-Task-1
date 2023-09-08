const CartController = require("../controllers/cart_controller");
const {
  validateToken,
  validateOrderCreateToken,
} = require("../middleware/token_validation");
const { validateCart } = require("../middleware/cart_validator");
const express = require("express");
const router = express.Router();

router.post(
  "/create/:user_id",
  validateCart,
  validateToken,
  validateOrderCreateToken,
  CartController.createCart
);
router.delete(
  "/:user_id",
  validateToken,
  validateOrderCreateToken,
  CartController.deleteCart
);

module.exports = router;
