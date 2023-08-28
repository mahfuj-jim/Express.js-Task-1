const { success, failure } = require("../util/common.js");
const Restaurant = require("../models/restaurant.js");
const express = require("express");
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const result = await Restaurant.getAllRestaurantData(true);
    if (result.success) {
      success(res, "Successfully Received.", result.data);
    } else {
      failure(res, 500, "Failed to get data", result.error);
    }
  } catch (err) {
    failure(res, 500, "Failed to get data", "Internal Server Issue");
  }
});

router.get("/all/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    console.log(restaurantId);
    const result = await Restaurant.getRestaurantById(restaurantId);

    if (result.success) {
      success(res, "Successfully Received.", result.data);
    } else {
      failure(res, result.code, "Failed to get data", result.error);
    }
  } catch (err) {
    failure(res, 500, "Failed to get data", "Internal Server Issue");
  }
});

router.post("/create", async (req, res) => {
  try {
    const result = await Restaurant.createRestaurant(JSON.parse(req.body));

    if (result.success) {
      success(res, "Successfully Created.", result.data);
    } else {
      failure(
        res,
        result.code,
        "Failed to create new restaurant",
        result.error
      );
    }
  } catch (err) {
    failure(
      res,
      500,
      "Failed to create new restaurant",
      "Internal Server Issue"
    );
  }
});

router.put("/update/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    console.log(restaurantId);

    const result = await Restaurant.updateRestaurant(
      restaurantId,
      JSON.parse(req.body)
    );

    if (result.success) {
      success(res, "Successfully Updated.", result.data);
    } else {
      failure(res, result.code, "Failed to update data", result.error);
    }
  } catch (err) {
    failure(res, 500, "Failed to update data", "Internal Server Issue");
  }
});

router.delete("/delete/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const result = await Restaurant.deleteRestaurantById(restaurantId);
    if (result.success) {
      success(res, "Successfully Deleted.", result.data);
    } else {
      failure(res, result.code, "Failed to delete data", result.error);
    }
  } catch (err) {
    failure(res, 500, "Failed to delete data", "Internal Server Issue");
  }
});

router.get("/review", async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const result = await Restaurant.getRestaurantReview(restaurantId);

    if (result.success) {
      success(res, "Successfully Received Reviews.", result.data);
    } else {
      failure(res, result.code, "Failed to get reviews", result.error);
    }
  } catch (err) {
    failure(res, 500, "Failed to get reviews", "Internal Server Error");
  }
});

router.post("/review", async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const result = await Restaurant.createRestaurantReview(
      restaurantId,
      JSON.parse(req.body)
    );

    if (result.success) {
      success(res, "Successfully Received Reviews.", result.data);
    } else {
      failure(res, result.code, "Failed to add review", result.error);
    }
  } catch (err) {
    console.log(err);
    failure(res, 500, "Failed to add review", "Internal Server Error");
  }
});

module.exports = router;