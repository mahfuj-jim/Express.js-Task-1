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
        const updatedRestaurant = {
          ...restaurantData[restaurantIndex],
          ...newRestaurant,
        };

        restaurantData[restaurantIndex] = updatedRestaurant;

        await fsPromise.writeFile(
          this.restaurantFilePath,
          JSON.stringify(restaurantData),
          "utf-8"
        );
        writeToLogFile(`Update Restaurant with ID ${id}`);

        return { success: true, data: restaurantData[restaurantIndex] };
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

  async createRestaurantReview(restaurant_id, user_id, review) {
    try {
      const responseData = await this.getAllRestaurantData();
      const restaurantData = responseData.data;

      const restaurantIndex = restaurantData.findIndex(
        (item) => item.id == restaurant_id
      );

      const currentReviews = restaurantData[restaurantIndex].reviews;
      const newReview = {
        id: currentReviews[currentReviews.length - 1].id + 1,
        userId: user_id,
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
    } catch (err) {
      console.log(err);
      return { success: false, code: 500, error: "Internal Server Issue" };
    }
  }

  async findByEmail(email) {
    try {
      const responseData = await this.getAllRestaurantData();
      const restaurantData = responseData.data;

      const restaurant = restaurantData.find((item) => item.email === email);
      return restaurant;
    } catch (err) {
      return { success: false, code: 500, error: "Internal Server Issue" };
    }
  }
}

module.exports = new Restaurant();
