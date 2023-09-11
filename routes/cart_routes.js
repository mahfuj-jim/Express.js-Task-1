const CartController = require("../controllers/cart_controller");
const {
  validateToken,
  validateOrderCreateToken,
} = require("../middleware/token_validation");
const { validateCart } = require("../middleware/cart_validator");
const express = require("express");
const router = express.Router();

router.get(
  "/get",
  validateToken,
  validateOrderCreateToken,
  CartController.getCart
);
router.post(
  "/create",
  validateCart,
  validateToken,
  validateOrderCreateToken,
  CartController.createCart
);
router.delete(
  "/",
  validateToken,
  validateOrderCreateToken,
  CartController.deleteCart
);
router.patch(
  "/additem/",
  validateCart,
  validateToken,
  validateOrderCreateToken,
  CartController.addItemToCart
);
router.patch(
  "/removeitem/",
  validateToken,
  validateOrderCreateToken,
  CartController.removeItemFromCart
);

module.exports = router;
