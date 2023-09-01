const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  time: {
    type: Date,
    required: true,
  },
  order_status: {
    type: String,
    required: true,
  },
  delivery_fee: {
    type: Number,
    required: true,
  },
  total_price: {
    type: Number,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "restaurants",
    required: true,
  },
  order_list: [
    {
      dish_name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
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
