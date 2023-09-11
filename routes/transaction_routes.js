const TransactionController = require("../controllers/transaction_controller");
const { validateToken, validateOrderCreateToken, } = require("../middleware/token_validation");
const express = require("express");
const router = express.Router();

router.post("/confirm", validateToken, validateOrderCreateToken, TransactionController.confirmTransaction);

module.exports = router;
