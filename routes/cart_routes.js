const CartController = require("../controllers/cart_controller");
const {
  validateToken,
  validateOrderCreateToken,
} = require("../middleware/token_validation");
const { validateCart } = require("../middleware/cart_validator");
const express = require("express");
const router = express.Router();

router.get(
  "/get/:user_id",
  validateToken,
  validateOrderCreateToken,
  CartController.getCart
);
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
router.post(
  "/additem/:user_id",
  validateCart,
  validateToken,
  validateOrderCreateToken,
  CartController.addItemToCart
);
router.delete(
  "/removeitem/:user_id",
  validateToken,
  validateOrderCreateToken,
  CartController.removeItemFromCart
);

module.exports = router;
