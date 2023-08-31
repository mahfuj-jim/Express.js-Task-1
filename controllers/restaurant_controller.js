const { success, failure } = require("../util/common.js");
const RestaurantModel = require("../models/restaurant_model.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

class RestaurantController {
  async getAllRestaurantData(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;

      RestaurantModel.find({})
        .then((restaurantData) => {
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedRestaurants = restaurantData.slice(
            startIndex,
            endIndex
          );

          success(res, "Successfully Received.", paginatedRestaurants);
        })
        .catch((error) => {
          failure(res, 500, "Failed to get data", "Internal Server Issue");
        });
    } catch (err) {
      failure(res, 500, "Failed to get data", "Internal Server Issue");
    }
  }

  async getRestaurantById(req, res) {
    try {
      const { restaurantId } = req.params;
      RestaurantModel.findOne({ _id: restaurantId }, { password: false })
        .then((restaurant) => {
          return success(res, "Successfully Received.", restaurant);
        })
        .catch((error) => {
          return failure(
            res,
            400,
            "Failed to get data",
            "Restaurant not found"
          );
        });
    } catch (err) {
      return failure(res, 500, "Failed to get data", "Internal Server Issue");
    }
  }

  async createRestaurant(req, res) {
    try {
      let restaurant = JSON.parse(req.body);

      const hashedPassword = await bcrypt.hash(restaurant.password, 10);
      restaurant = { ...restaurant, password: hashedPassword };

      RestaurantModel.create(restaurant)
        .then((createdRestaurant) => {
          createdRestaurant.password = undefined;
          return success(res, "Successfully Created.", createdRestaurant);
        })
        .catch((error) => {
          console.log(error);
          return failure(
            res,
            500,
            "Failed to create new restaurant",
            "Internal Server Issue"
          );
        });
    } catch (err) {
      console.log(err);
      failure(
        res,
        500,
        "Failed to create new restaurant",
        "Internal Server Issue"
      );
    }
  }

  async updateRestaurant(req, res) {
    try {
      const { restaurantId } = req.params;

      RestaurantModel.findOne({ _id: restaurantId })
        .then((restaurant) => {
          RestaurantModel.updateOne({ _id: restaurantId }, JSON.parse(req.body))
            .then((updatedRestaurant) => {
              return success(
                res,
                "Successfully Updated.",
                JSON.parse(req.body)
              );
            })
            .catch((error) => {
              return failure(
                res,
                500,
                "Failed to Update",
                "Internal Server Issue"
              );
            });
        })
        .catch((error) => {
          console.log(error);
          return failure(
            res,
            400,
            "Failed to get data",
            "Restaurant not found"
          );
        });
    } catch (err) {
      failure(res, 500, "Failed to update data", "Internal Server Issue");
    }
  }

  async deleteRestaurantById(req, res) {
    try {
      const { restaurantId } = req.params;

      RestaurantModel.findOne({ _id: restaurantId })
        .then((restaurant) => {
          RestaurantModel.deleteOne({ _id: restaurantId })
            .then((deleteed) => {
              return success(
                res,
                "Successfully Executed",
                `Delete Restaurant with ID ${restaurantId}`
              );
            })
            .catch((error) => {
              return failure(
                res,
                500,
                "Failed to Update",
                "Internal Server Issue"
              );
            });
        })
        .catch((error) => {
          console.log(error);
          return failure(
            res,
            400,
            "Failed to get data",
            "Restaurant not found"
          );
        });
    } catch (err) {
      failure(res, 500, "Failed to delete data", "Internal Server Issue");
    }
  }

  // async getRestaurantReview(req, res) {
  //   try {
  //     const { restaurantId } = req.query;
  //     const result = await Restaurant.getRestaurantReview(restaurantId);

  //     if (result.success) {
  //       success(res, "Successfully Received Reviews.", result.data);
  //     } else {
  //       failure(res, result.code, "Failed to get reviews", result.error);
  //     }
  //   } catch (err) {
  //     failure(res, 500, "Failed to get reviews", "Internal Server Error");
  //   }
  // }

  // async createRestaurantReview(req, res) {
  //   try {
  //     const authHeader = req.header("Authorization");
  //     const token = authHeader.substring(7);
  //     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  //     const user_id = decodedToken.user.user_id;

  //     const { restaurantId } = req.query;
  //     const result = await Restaurant.createRestaurantReview(
  //       restaurantId,
  //       user_id,
  //       JSON.parse(req.body)
  //     );

  //     if (result.success) {
  //       success(res, "Successfully Received Reviews.", result.data);
  //     } else {
  //       failure(res, result.code, "Failed to add review", result.error);
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     failure(res, 500, "Failed to add review", "Internal Server Error");
  //   }
  // }

  async login(req, res) {
    try {
      const { email, password } = JSON.parse(req.body);

      RestaurantModel.findOne({ email }).then( async (restaurant) => {
        const isPasswordValid = await bcrypt.compare(password, restaurant.password);

      if (!isPasswordValid) {
        return failure(res, 401, "Login failed", "Invalid password");
      }

      const token = jwt.sign(
        {
          restaurant: {
            id: restaurant._id,
            name: restaurant.name,
            location: restaurant.location,
            cuisine: restaurant.cuisine,
            rating: restaurant.rating,
            contactNumber: restaurant.contactNumber,
            owner: restaurant.owner,
            email: restaurant.email,
          },
          role: "restaurant",
        },
        process.env.ACCESS_TOKEN_SECRET
      );

      return success(res, "Authentication successful", {
        token,
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          location: restaurant.location,
          cuisine: restaurant.cuisine,
          rating: restaurant.rating,
          contactNumber: restaurant.contactNumber,
          owner: restaurant.owner,
          email: restaurant.email,
        },
      });
      }).catch(error => {
        return failure(res, 401, "Login failed", "Restaurant not found");
      });
    } catch (err) {
      console.log(err);
      failure(res, 500, "Login failed", "Internal Server Issue");
    }
  }
}

module.exports = new RestaurantController();
