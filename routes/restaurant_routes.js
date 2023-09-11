const RestaurantController = require("../controllers/restaurant_controller");
const { validateToken, validateUserToken, validateRestaurantViewToken, validateRestaurantModiyToken } = require("../middleware/token_validation.js");
const { validateDish, validateQueryParams } = require("../middleware/restaurant_validator");
const express = require("express");
const router = express.Router();

router.get("/all", validateQueryParams, validateToken, validateUserToken, RestaurantController.getAllRestaurantData);
router.get("/all/:restaurantId", validateToken, validateRestaurantViewToken, RestaurantController.getRestaurantById);
router.post("/menu/:restaurantId", validateDish, validateToken, validateRestaurantModiyToken, RestaurantController.createMenuItem);
router.get("/menu/:restaurantId", validateToken, validateRestaurantViewToken, RestaurantController.getRestaurantMenu);
router.post("/review/", validateToken, RestaurantController.addRestaurantReview);

module.exports = router;