const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  time: {
    type: Date,
  },
  order_status: {
    type: String,
  },
  delivery_fee: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "restaurants",
    required: true,
  },
  order_list: [
    {
      dish_name: {
        type: String,
      },
      price: {
        type: Number,
      },
      quantity: {
        type: Number,
      },
    },
  ],
  location: {
    type: String,
    required: true,
  },
  delivered_time: {
    type: Date,
  },
});

const OrderModel = mongoose.model("orders", orderSchema);

module.exports = OrderModel;
