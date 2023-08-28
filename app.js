const express = require("express");
const { success, failure } = require("./util/common.js");
const Restaurant = require("./model/restaurant.js");
const User = require("./model/user.js");
const Order = require("./model/order.js");

const app = express();
const PORT = 8000;

app.use(express.json());

app.get("/restaurant/all", async (req, res) => {
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

app.get("/restaurant/all/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;
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

app.use((req, res) => {
  failure(res, 400, "Not Found", "Request not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
