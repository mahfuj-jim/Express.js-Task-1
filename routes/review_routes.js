const ReviewController = require("../controllers/review_controller");
const { validateToken } = require("../middleware/token_validation.js");
const express = require("express");
const router = express.Router();

router.post("/restaurant/", validateToken, ReviewController.addRestaurantReview);

module.exports = router;