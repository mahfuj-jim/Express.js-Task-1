const RestaurantController = require("../controllers/restaurant_controller.js");
const {validateRestaurantData} = require("../middleware/validator.js");
const {authenticateRestaurant, validateRestaurantReview} = require("../middleware/restaurant_validator.js");
const {authenticateUser} = require("../middleware/user_validator.js");
const express = require("express");
const routes = express.Router();

routes.get("/all", authenticateUser, RestaurantController.getAllRestaurantData);
routes.get("/all/:restaurantId", authenticateUser, RestaurantController.getRestaurantById);
routes.post("/create", validateRestaurantData, RestaurantController.createRestaurant);
routes.patch("/update/:restaurantId", RestaurantController.updateRestaurant);
routes.delete("/delete/:restaurantId", RestaurantController.deleteRestaurantById);

// routes.patch("/update/:restaurantId", authenticateRestaurant, RestaurantController.updateRestaurant);
// routes.get("/review", validateRestaurantReview, RestaurantController.getRestaurantReview);
// routes.post("/review", authenticateUser, RestaurantController.createRestaurantReview); 

// auth
routes.post('/login', RestaurantController.login);

module.exports = routes;