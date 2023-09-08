const CartController = require("../controllers/cart_controller");
const { validateToken } = require("../middleware/token_validation");
const { validateOrderCreateToken } = require("../middleware/token_validation");
const express = require("express");
const router = express.Router();

router.post("/cart/:user_id", validateCart, validateToken, validateOrderCreateToken, CartController.createCart);
router.delete("/cart/:user_id", validateToken, validateOrderCreateToken, CartController.deleteCart);

module.exports = router;