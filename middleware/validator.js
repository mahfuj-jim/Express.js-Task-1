const { failure } = require("../util/common.js");
const Restaurant = require("../models/restaurant.js");
const User = require("../models/user.js");
// const { body } = require("express-validator");

// const validator = {
//   create: [
//     body("name")
//       .exists()
//       .withMessage("Name was not provided")
//       .isString()
//       .withMessage("Name must be a string"),
//     body("openHours").exists().withMessage("Open Hours was not provided"),
//     body("deliveryOptions")
//       .exists()
//       .withMessage("Delivery Options was not provided")
//       .not()
//       .custom((value) => {
//         const { deliveryArea, deliveryFee } = value;

//         if (!deliveryArea || deliveryArea === "" || deliveryArea.length == 0) {
//           throw new Error("Delivery Area was not provided");
//         }

//         if (!deliveryFee || deliveryFee === "") {
//           errors.deliveryFee = "Delivery Fee is not provided";
//         } else if (deliveryFee > 100) {
//           errors.deliveryFee = "Delivery Fee should not more than 100";
//         }

//         return true;
//       }),
//   ],
// };

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
  }else if(password.length < 8){
    errors.password = "Password must be 8 or more characters";
  }

  if (Object.keys(errors).length > 0) {
    return failure(res, 422, "Invalid Input", errors);
  }

  next();
};

const validateNewOrderData = async (req, res, next) => {
  const restaurantData = await Restaurant.getAllRestaurantData();

  let newOrder = JSON.parse(req.body);
  const { restaurant_id, order_list, location } = newOrder;
  const errors = {};

  if (!restaurant_id) {
    errors.restaurant_id = "Restaurant ID is not provided";
  } else {
    const restaurantIndex = restaurantData.data.findIndex(
      (restaurant) => newOrder.restaurant_id === restaurant.id
    );
    if (restaurantIndex == -1) {
      errors.restaurant_id = "Restaurant ID not found";
    } else {
      if (
        !restaurantData.data[restaurantIndex].deliveryOptions.deliveryArea
          .toLowerCase()
          .includes(location.toLowerCase())
      ) {
        errors.location = "Delivery is not available in your location";
      }
    }
  }

  if (!order_list || order_list.length === 0) {
    errors.order_list = "Order List is not provided";
  }

  if (!location || location === "") {
    errors.location = "Location is not provided";
  }

  if (Object.keys(errors).length > 0) {
    return failure(res, 422, "Invalid Input", errors);
  }

  next();
};

module.exports = { validateRestaurantData, validateNewOrderData };
