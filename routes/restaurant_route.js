const RestaurantController = require("../controllers/restaurant_controller.js");
const {validateNewRestaurantData} = require("../middleware/restaurant_validator.js");
const express = require("express");
const routes = express.Router();

routes.get("/all", RestaurantController.getAllRestaurantData);
routes.get("/all/:restaurantId", RestaurantController.getRestaurantById);
routes.post("/create", validateNewRestaurantData, RestaurantController.createRestaurant);
routes.put("/update/:restaurantId", validateNewRestaurantData, RestaurantController.updateRestaurant);
routes.delete("/delete/:restaurantId", RestaurantController.deleteRestaurantById);
routes.get("/review", RestaurantController.getRestaurantReview);
routes.post("/review", RestaurantController.createRestaurantReview); 

module.exports = routes;