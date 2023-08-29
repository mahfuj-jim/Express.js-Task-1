const RestaurantController = require("../controllers/restaurant_controller.js");
const express = require("express");
const routes = express.Router();

routes.get("/all", RestaurantController.getAllRestaurantData);
routes.get("/all/:restaurantId", RestaurantController.getRestaurantById);
routes.post("/create", RestaurantController.createRestaurant);
routes.put("/update/:restaurantId", RestaurantController.updateRestaurant);
routes.delete("/delete/:restaurantId", RestaurantController.deleteRestaurantById);
routes.get("/review", RestaurantController.getRestaurantReview);
routes.post("/review", RestaurantController.createRestaurantReview); 

module.exports = routes;