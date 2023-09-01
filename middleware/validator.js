const { failure } = require("../util/common.js");
const RestaurantModel = require("../models/restaurant_model.js");

const validateRestaurantData = (req, res, next) => {
  let newRestaurant = JSON.parse(req.body);

  const {
    name,
    openHours,
    deliveryOptions,
    location,
    cuisine,
    contactNumber,
    owner,
    password,
  } = newRestaurant;

  const errors = {};

  if (!name || name === "") {
    errors.name = "Name was not provided";
  }

  if (!openHours || openHours === "") {
    errors.openHours = "Open Hour was not provided";
  } else {
    const { weekdays, weekends } = openHours;

    if (!weekends || weekends === "" || !weekdays || weekdays === "") {
      errors.openHours = "Open Hour was not provided Accurately";
    }
  }

  if (!deliveryOptions || deliveryOptions === "") {
    errors.openHours = "Delivery Options was not provided Accurately";
  } else {
    const { deliveryArea, deliveryFee } = deliveryOptions;

    if (!deliveryArea || deliveryArea === "" || deliveryArea.length == 0) {
      errors.deliveryArea = "Delivery Area was not provided";
    }

    if (!deliveryFee || deliveryFee === "") {
      errors.deliveryFee = "Delivery Fee is not provided";
    } else if (deliveryFee > 100) {
      errors.deliveryFee = "Delivery Fee should not more than 100";
    }
  }

  if (!location || location === "") {
    errors.location = "Location was not provided";
  }

  if (!cuisine || cuisine === "") {
    errors.location = "Cuisine was not provided";
  }

  if (!contactNumber || contactNumber === "") {
    errors.location = "Contact Number was not provided";
  }

  if (!owner || owner === "") {
    errors.owner = "Owner was not provided";
  }

  if (!password || password === "") {
    errors.password = "Password was not provided";
  } else if (password.length < 8) {
    errors.password = "Password must be 8 or more characters";
  }

  if (Object.keys(errors).length > 0) {
    return failure(res, 422, "Invalid Input", errors);
  }

  next();
};

const validateNewOrderData = async (req, res, next) => {
  let newOrder = JSON.parse(req.body);
  const { restaurant, order_list, location } = newOrder;

  const errors = {};
  let restaurantData;

  if (!restaurant) {
    errors.restaurant = "Restaurant ID is not provided";
  } else {
    await RestaurantModel.findOne({ _id: restaurant })
      .then((restaurantDetails) => {
        restaurantData = restaurantDetails;
      })
      .catch((error) => {
        errors.restaurant = "Invalid Restaurant ID";
      });
  }

  if (!order_list || order_list.length === 0) {
    errors.order_list = "Order List is not provided";
  } else {
    try {
      const menuIdSet = new Set(
        restaurantData.menu.map((menuItem) => menuItem.id)
      );
      const invalidMenuIds = [];
      let totalOrderItems = 0;

      newOrder.order_list.filter((orderItem) => {
        if (!orderItem.menu_id) {
          errors.menu_id = "Item is not selected properly";
          return false;
        }

        if (!orderItem.quantity || orderItem.quantity <= 0) {
          errors.menu_quantity = "Quantity should be at least 1";
          return false;
        }

        if (!menuIdSet.has(orderItem.menu_id)) {
          invalidMenuIds.push(orderItem.menu_id);
        }

        totalOrderItems += orderItem.quantity;
        return true;
      });

      if (totalOrderItems > 20) {
        errors.quantity = "Total Quantity should be less than 20";
      }

      if (invalidMenuIds.length != 0) {
        errors.menu = `${invalidMenuIds} menu item didn't exist`;
      }
    } catch (err) {}
  }

  if (!location || location === "") {
    errors.location = "Location is not provided";
  } else {
    try {
      const isContained =
        restaurantData.deliveryOptions.deliveryArea.includes(location);

      if (!isContained) {
        errors.location = "Delivery is not available in your area";
      }
    } catch (err) {}
  }

  if (Object.keys(errors).length > 0) {
    return failure(res, 422, "Invalid Input", errors);
  }

  next();
};

module.exports = { validateRestaurantData, validateNewOrderData };
