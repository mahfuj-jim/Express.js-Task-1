const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    time: {
      type: Date,
      required: [true, "Time is not provided"],
    },
    transactionOption: {
      type: String,
      enum: ["Cash", "Bkash", "Nagad"],
      required: [true, "Transaction Option is not provided"],
    },
    transactionId: {
      type: String,
      required: [true, "Transaction Id is not provided"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is not provided"],
    },
    orders: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orders",
      required: [true, "Order is not provided"],
    },
  },
  {
    timestamps: true,
  }
);

const TransactionModel = mongoose.model("transactions", transactionSchema);

module.exports = TransactionModel;
