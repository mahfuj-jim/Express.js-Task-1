const express = require("express");
const { success, failure } = require("./util/common.js");
const Restaurant = require("./model/restaurant.js");
const User = require("./model/user.js");
const Order = require("./model/order.js");

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(express.text());

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

app.post("/restaurant/create", async (req, res) => {
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

app.put("/restaurant/update/:restaurantId", async (req, res) => {
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

app.delete("/restaurant/delete/:restaurantId", async (req, res) => {
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

app.use((req, res) => {
  failure(res, 400, "Not Found", "Request not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
