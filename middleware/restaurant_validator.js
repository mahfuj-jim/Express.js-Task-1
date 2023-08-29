const { failure } = require("../util/common.js");

const validateNewRestaurantData = (req, res, next) => {
  let newRestaurant = JSON.parse(req.body);
  
  const {
    name,
    openHours,
    deliveryOptions,
    location,
    cuisine,
    contactNumber,
    owner,
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

  if(Object.keys(errors).length > 0){
    return failure(res, 422, "Invalid Input", errors);
  }

  next();
};

module.exports = { validateNewRestaurantData };
