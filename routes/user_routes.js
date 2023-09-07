const UserController = require("../controllers/user_controller.js");
const {
  validateToken,
  validateAdminToken,
  validateOrderCreateToken,
} = require("../middleware/token_validation");
const { validateCart } = require("../middleware/user_validator.js");
const express = require("express");
const router = express.Router();

router.get(
  "/all",
  validateToken,
  validateAdminToken,
  UserController.getAllUserData
);
router.get("/all/:user_id", validateToken, UserController.getUserById);
router.post(
  "/cart/:user_id",
  validateCart,
  validateToken,
  validateOrderCreateToken,
  UserController.addToCart
);

module.exports = router;
