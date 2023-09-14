const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    time: {
      type: Date,
      required: [true, "Time is not provided"],
    },
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Ready",
        "Reached",
        "Delivered",
        "Cancelled",
      ],
      required: [true, "Order status is not provided"],
    },
    deliveryFee: {
      type: Number,
      required: [true, "Delivery fee is not provided"],
    },
    orderList: {
      type: [
        {
          dishName: {
            type: String,
            required: [true, "Dish name is required"],
          },
          quantity: {
            type: Number,
            required: [true, "Quantity is required"],
          },
          price: {
            type: Number,
            required: [true, "Price is required"],
          },
        },
      ],
      required: [true, "Order list is not provided"],
    },
    location: {
      type: String,
      required: [true, "Location is not provided"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Total Price is not provided"],
    },
    restaurants: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurants",
      required: [true, "Restaurant is not provided"],
    },
    users: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "User is not provided"],
    },
    riders: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "riders",
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model("orders", orderSchema);

module.exports = OrderModel;
