const fsPromise = require("fs").promises;
const path = require("path");
const User = require("./user.js");
const { writeToLogFile } = require("../util/common.js");
const user = require("./user.js");

class Restaurant {
  constructor() {
    this.restaurantFilePath = path.join(
      __dirname,
      "..",
      "data",
      "restaurants.json"
    );
  }

  async getAllRestaurantData(isSearch = false) {
    return fsPromise
      .readFile(this.restaurantFilePath, "utf-8")
      .then((data) => {
        if (isSearch) {
          writeToLogFile("Get All Restaurant Data");
        }
        return { success: true, data: JSON.parse(data) };
      })
      .catch((err) => {
        return { success: false, error: "Internal Server Issue" };
      });
  }

  async getRestaurantById(id) {
    try {
      const responseData = await this.getAllRestaurantData();
      const restaurantData = responseData.data;

      const restaurant = restaurantData.filter((item) => item.id == id);
      console.log(restaurant.length);

      if (restaurant.length != 0) {
        writeToLogFile(`Get Restaurant with ID ${id}`);
        return { success: true, data: restaurant[0] };
      } else {
        return { success: false, code: 400, error: "Invalid Restaurant ID" };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: "Internal Server Issue" };
    }
  }

  async createRestaurant(newRestaurant) {
    try {
      const responseData = await this.getAllRestaurantData();
      const restaurantData = responseData.data;

      const validationError = this.validateNewRestaurantData(
        restaurantData,
        newRestaurant,
        true
      );

      if (JSON.stringify(validationError) === "{}") {
        newRestaurant = {
          id: restaurantData[restaurantData.length - 1].id + 1,
          ...newRestaurant,
        };
        restaurantData.push(newRestaurant);

        await fsPromise.writeFile(
          this.restaurantFilePath,
          JSON.stringify(restaurantData),
          "utf-8"
        );
        writeToLogFile(`Create Restaurant with ID ${newRestaurant.id}`);

        return { success: true, data: newRestaurant };
      } else {
        return { success: false, code: 400, error: validationError };
      }
    } catch (err) {
      console.log(err);
      return { success: false, code: 500, error: "Internal Server Issue" };
    }
  }

  async updateRestaurant(id, newRestaurant) {
    try {
      const responseData = await this.getAllRestaurantData();
      const restaurantData = responseData.data;

      const restaurantIndex = restaurantData.findIndex((item) => item.id == id);

      if (restaurantIndex != -1) {
        const validationError = this.validateNewRestaurantData(
          restaurantData,
          newRestaurant,
          false
        );

        if (JSON.stringify(validationError) === "{}") {
          newRestaurant = {
            id: parseInt(id),
            ...newRestaurant,
          };

          restaurantData[restaurantIndex] = {
            ...responseData[restaurantIndex],
            ...newRestaurant,
          };

          await fsPromise.writeFile(
            this.restaurantFilePath,
            JSON.stringify(restaurantData),
            "utf-8"
          );
          writeToLogFile(`Update Restaurant with ID ${id}`);

          return { success: true, data: newRestaurant };
        } else {
          return { success: false, code: 400, error: validationError };
        }
      } else {
        return {
          success: false,
          code: 400,
          error: "Restaurant ID is Not Valid",
        };
      }
    } catch (err) {
      console.log(err);
      return { success: false, code: 500, error: "Internal Server Issue" };
    }
  }

  async deleteRestaurantById(id) {
    try {
      const responseData = await this.getAllRestaurantData();
      let restaurantData = responseData.data;

      const restaurant = restaurantData.find((item) => item.id == id);

      if (typeof restaurant != "undefined") {
        restaurantData = restaurantData.filter((item) => item.id != id);

        await fsPromise.writeFile(
          this.restaurantFilePath,
          JSON.stringify(restaurantData),
          "utf-8"
        );
        writeToLogFile(`Delete Restaurant with ID ${id}`);

        return { success: true, data: `Restaurant with ID ${id} is deleted` };
      } else {
        return {
          success: false,
          code: 400,
          error: "Restaurant ID is Not Valid",
        };
      }
    } catch (err) {
      console.error(err);
      return { success: false, code: 500, error: "Internal Server Issue" };
    }
  }

  async getRestaurantReview(id) {
    try {
      const responseData = await this.getAllRestaurantData();
      let restaurantData = responseData.data;

      const restaurant = restaurantData.find((item) => item.id == id);

      if (restaurant.hasOwnProperty("reviews")) {
        const userData = await User.getAllUserData();

        const reviews = restaurant.reviews.map((review) => {
          const user = userData.data.find(
            (user) => user.user_id === review.userId
          );
          return { ...review, user_name: user.name };
        });

        writeToLogFile(`Get REview for Restaurant with ID ${id}`);

        return {
          success: true,
          data: {
            restaurant_id: restaurant.id,
            name: restaurant.name,
            rating: restaurant.rating,
            reviews: reviews,
          },
        };
      } else {
        return { success: false, code: 400, error: "No Reviews Found" };
      }
    } catch (err) {
      return { success: false, code: 500, error: "Internal Server Issue" };
    }
  }

  async createRestaurantReview(restaurant_id, review) {
    try {
      const responseData = await this.getAllRestaurantData();
      const restaurantData = responseData.data;

      const restaurantIndex = restaurantData.findIndex(
        (item) => item.id == restaurant_id
      );

      if (restaurantIndex != -1) {
        const responseUserData = await User.getAllUserData();
        const userData = responseUserData.data;

        const userIndex = userData.findIndex(
          (user) => user.user_id == review.userId
        );

        if (userIndex != 1) {
          const currentReviews = restaurantData[restaurantIndex].reviews;
          const newReview = {
            id: currentReviews[currentReviews.length - 1].id + 1,
            ...review,
          };
          currentReviews.push(newReview);
          restaurantData[restaurantIndex].reviews = currentReviews;

          let numberOfRating = 0;
          let totalRating = 0;

          currentReviews.map((item) => {
            numberOfRating++;
            totalRating += item.rating;
          });

          restaurantData[restaurantIndex] = {
            ...restaurantData[restaurantIndex],
            ...{ rating: totalRating / numberOfRating },
          };

          await fsPromise.writeFile(
            this.restaurantFilePath,
            JSON.stringify(restaurantData),
            "utf-8"
          );
          writeToLogFile(
            `Create new Review for Restaurant with ID ${restaurant_id}`
          );

          return { success: true, data: newReview };
        } else {
          return { success: false, code: 400, error: "User is Not Valid" };
        }
      } else {
        return { success: false, code: 400, error: "Restaurant is Not Valid" };
      }
    } catch (err) {
      console.log(err);
      return { success: false, code: 500, error: "Internal Server Issue" };
    }
  }

  validateNewRestaurantData(restaurantData, newRestaurant, isNewRestaurant) {
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
    } else if (isNewRestaurant) {
      const existingName = restaurantData.filter((item) => item.name === name);
      if (existingName.length != 0) {
        errors.name = "Name already exists";
      }
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
      errors.location = "Owner was not provided";
    }

    return errors;
  }
}

module.exports = new Restaurant();
