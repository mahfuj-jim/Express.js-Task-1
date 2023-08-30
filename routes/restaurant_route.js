const RestaurantController = require("../controllers/restaurant_controller.js");
const {validateRestaurantData} = require("../middleware/validator.js");
const {authenticateUser} = require("../middleware/user_validator.js");
const express = require("express");
const routes = express.Router();

routes.get("/all", RestaurantController.getAllRestaurantData);
routes.get("/all/:restaurantId", RestaurantController.getRestaurantById);
routes.post("/create", validateRestaurantData, RestaurantController.createRestaurant);
routes.patch("/update/:restaurantId", validateRestaurantData, RestaurantController.updateRestaurant);
routes.delete("/delete/:restaurantId", RestaurantController.deleteRestaurantById);
routes.get("/review", RestaurantController.getRestaurantReview);
routes.post("/review", authenticateUser, RestaurantController.createRestaurantReview); 

// auth
routes.post('/login', RestaurantController.login);

module.exports = routes;