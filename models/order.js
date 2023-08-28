const fsPromise = require("fs").promises;
const path = require("path");
const User = require("./user.js");
const Restaurant = require("./restaurant.js");
const { writeToLogFile, getCurrentDateTime } = require("../util/common.js");

class Order {
  constructor() {
    this.orderFilePath = path.join(__dirname, "..", "data", "orders.json");
  }

  async getAllOrderData(isSearch = false) {
    try {
      const data = await fsPromise.readFile(this.orderFilePath, "utf-8");
      let orderData = JSON.parse(data);

      orderData = await Promise.all(
        orderData.map(async (order) => {
          const userData = await User.getAllUserData();
          const user = userData.data.find(
            (user) => user.user_id === order.user_id
          );

          const restaurantData = await Restaurant.getAllRestaurantData();
          const restaurant = restaurantData.data.find(
            (restaurant) => restaurant.id === order.restaurant_id
          );

          if (isSearch) {
            writeToLogFile("Get All Orders Data");
            return {
              ...order,
              user_name: user.name,
              user_contact_number: user.phoneNumber,
              restaurant_name: restaurant.name,
              restaurant_location: restaurant.location,
              restaurant_contact_number: restaurant.contactNumber,
            };
          } else {
            return order;
          }
        })
      );

      return { success: true, data: orderData };
    } catch (err) {
      console.log(err);
      return { success: false, error: "Internal Server Issue" };
    }
  }

  async getOrderById(id) {
    try {
      const responseData = await this.getAllOrderData(true);
      const orderData = responseData.data;

      const order = orderData.find((item) => item.order_id == id);

      if (typeof order != "undefined") {
        writeToLogFile(`Get Order with ID ${id}`);
        return { success: true, data: order };
      } else {
        return { success: false, code: 400, error: "Order ID is Not Valid" };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: "Internal Server Issue" };
    }
  }

  async createOrder(newOrder) {
    try {
      const responseData = await this.getAllOrderData();
      const orderData = responseData.data;

      const restaurantData = await Restaurant.getAllRestaurantData();
      const userData = await User.getAllUserData();

      const validationError = this.validateNewOrderData(
        newOrder,
        restaurantData,
        userData
      );

      if (JSON.stringify(validationError) === "{}") {
        const time = `${getCurrentDateTime()}`;
        let total_price = 0;

        const restaurant = restaurantData.data.find(
          (restaurant) => restaurant.id === newOrder.restaurant_id
        );

        newOrder.order_list = await Promise.all(
          newOrder.order_list.map((item) => {
            const orderItem = restaurant.menu.find(
              (menu) => item.menu_id === menu.id
            );
            total_price += orderItem.price * item.quantity;

            return {
              dish_name: orderItem.dishName,
              price: orderItem.price,
              quantity: item.quantity,
            };
          })
        );

        const delivery_fee = restaurant.deliveryOptions.deliveryFee;
        total_price += delivery_fee;

        newOrder = {
          order_id: orderData[orderData.length - 1].order_id + 1,
          time: time,
          order_status: "On Process",
          delivery_fee: delivery_fee,
          total_price: total_price,
          ...newOrder,
        };

        orderData.push(newOrder);

        await fsPromise.writeFile(
          this.orderFilePath,
          JSON.stringify(orderData),
          "utf-8"
        );
        writeToLogFile(`Create Order with ID ${newOrder.order_id}`);

        return { success: true, data: newOrder };
      } else {
        console.log("error");
        return { success: false, code: 400, error: validationError };
      }
    } catch (err) {
      console.log(err);
      return { success: false, code: 500, error: "Internal Server Issue" };
    }
  }

  async getRestaurantOrder(restaurant_id) {
    try {
      const responseData = await this.getAllOrderData(true);
      const orderData = responseData.data;
      const orders = orderData.filter(
        (order) => order.restaurant_id == restaurant_id
      );

      const responseRestaurantData = await Restaurant.getAllRestaurantData();
      const restaurantData = responseRestaurantData.data;
      const restaurantIndex = restaurantData.findIndex(
        (item) => item.id == restaurant_id
      );

      if (restaurantIndex != -1) {
        if (typeof orders != "undefined") {
          writeToLogFile(`Get Order for Restaurant ID ${restaurant_id}`);
          return { success: true, data: orders };
        } else {
          return {
            success: false,
            code: 400,
            error: "Restaurant ID is Not Valid",
          };
        }
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

  async getUserOrder(user_id) {
    try {
      const responseData = await this.getAllOrderData(true);
      const orderData = responseData.data;
      const orders = orderData.filter((order) => order.user_id == user_id);

      const responseUserData = await User.getAllUserData();
      const userData = responseUserData.data;
      const userIndex = userData.findIndex((item) => item.user_id == user_id);

      if (userIndex != -1) {
        if (typeof orders != "undefined") {
          writeToLogFile(`Get Order for User ID ${user_id}`);
          return { success: true, data: orders };
        } else {
          return {
            success: false,
            code: 500,
            error: "Internal Server Error",
          };
        }
      } else {
        return {
          success: false,
          code: 400,
          error: "User ID is Not Valid",
        };
      }
    } catch (err) {
      console.error(err);
      return { success: false, code: 500, error: "Internal Server Issue" };
    }
  }

  async completeOrder(order_id) {
    try {
      const responseData = await this.getAllOrderData();
      const orderData = responseData.data;

      const orderIndex = orderData.findIndex(
        (order) => order.order_id == order_id
      );

      if (orderIndex != -1) {
        const time = `${getCurrentDateTime()}`;

        orderData[orderIndex] = {
          ...orderData[orderIndex],
          ...{ order_status: "done" },
          delivered_time: time,
        };

        await fsPromise.writeFile(
          this.orderFilePath,
          JSON.stringify(orderData),
          "utf-8"
        );
        writeToLogFile(`Comeplete Order with ID ${order_id}`);

        return { success: true, data: orderData[orderIndex] };
      } else {
        return { success: false, code: 400, error: "Invalid Order ID" };
      }
    } catch (err) {
      return { success: false, code: 500, error: "Internal Server Issue" };
    }
  }

  async validateNewOrderData(newOrder, restaurantData, userData) {
    const { user_id, restaurant_id, order_list, location } = newOrder;
    const errors = {};

    if (!user_id) {
      errors.user_id = "User ID is not provided";
    } else {
      const userIndex = userData.data.findIndex(
        (user) => user.user_id === newOrder.user_id
      );
      if (userIndex == -1) {
        errors.user_id = "User ID not found";
      }
    }

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

    return errors;
  }
}

module.exports = new Order();
