const express = require("express");
const { success, failure } = require("./util/common.js");
const Restaurant = require("./model/restaurant.js");
const User = require("./model/user.js");
const Order = require("./model/order.js");

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

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

app.get("/restaurant/review", async (req, res) => {
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

app.post("/restaurant/review", async (req, res) => {
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

app.get("/user/all", async (req, res) => {
  try {
    const result = await User.getAllUserData(true);
    if (result.success) {
      success(res, "Successfully Received User Data.", result.data);
    } else {
      failure(res, result.code, "Failed to get user data", result.error);
    }
  } catch (err) {
    failure(res, 500, "Failed to get user data", "Internal Server Issue");
  }
});

app.get("/user/all/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await User.getUserById(userId);

    if (result.success) {
      success(res, "Successfully Received.", result.data);
    } else {
      failure(res, result.code, "Failed to get data", result.error);
    }
  } catch (err) {
    failure(res, 500, "Failed to get data", "Internal Server Issue");
  }
});

app.get("/order/all", async (req, res) => {
  try {
    const result = await Order.getAllOrderData(true);

    if (result.success) {
      success(res, "Successfully Received.", result.data);
    } else {
      failure(res, result.code, "Failed to get data", result.error);
    }
  } catch (err) {
    failure(res, 500, "Failed to get data", result.error);
  }
});

app.get("/order", async (req, res) => {
  try {
    const { id, restaurant_id, user_id } = req.query;

    if (id !== undefined) {
      const result = await Order.getOrderById(id);
      if (result.success) {
        success(res, "Successfully Received.", result.data);
      } else {
        failure(res, result.code, "Failed to get data", result.error);
      }
    } else if (restaurant_id !== undefined) {
      const result = await Order.getRestaurantOrder(restaurant_id);
      if (result.success) {
        success(res, "Successfully Received.", result.data);
      } else {
        failure(res, result.code, "Failed to get data", result.error);
      }
    } else if (user_id !== undefined) {
      const result = await Order.getUserOrder(user_id);
      if (result.success) {
        success(res, "Successfully Received.", result.data);
      } else {
        failure(res, result.code, "Failed to get data", result.error);
      }
    } else {
      failure(res, 400, "Failed to connect", "Request not found");
    }
  } catch (err) {
    failure(res, 500, "Failed to get data", "Internal Server Error");
  }
});

app.put('/order/status', async (req, res) => {
  try {
      const {orderId, order_status} = req.query;

      if (order_status === 'done') {
          const result = await Order.completeOrder(orderId);

          if (result.success) {
              success(res, 'Successfully Done.', result.data);
          } else {
              failure(res, result.code, 'Failed to update', result.error);
          }
      } else {
          failure(res, 400, 'Failed to connect', 'Invalid request');
      }
  } catch (err) {
    console.log(err);
      failure(res, 500, 'Failed to update', 'Internal Server Error');
  }
});

app.post('/order/create', async (req, res) => {
  try {
      const result = await Order.createOrder(JSON.parse(req.body));

      if (result.success) {
          success(res, 'Successfully Created.', result.data);
      } else {
          failure(res, result.code, 'Failed to create new order', result.error);
      }
  } catch (err) {
      failure(res, 500, 'Failed to create new order', 'Internal Server Issue');
  }
});

app.use((req, res) => {
  failure(res, 400, "Not Found", "Request not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
