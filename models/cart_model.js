const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    users: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    restaurants: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurants",
    },
    orderList: [
      {
        dishId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        quantity: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CartModel = mongoose.model("carts", cartSchema);

module.exports = CartModel;
