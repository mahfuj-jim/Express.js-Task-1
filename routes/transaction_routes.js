const TransactionController = require("../controllers/transaction_controller");
const { validateToken } = require("../middleware/token_validation");
const { validateConfirmOrderByRestaurant } = require("../middleware/order_validator");
const express = require("express");
const router = express.Router();

router.post("/confirm", validateToken, TransactionController.confirmTransaction);

module.exports = router;
