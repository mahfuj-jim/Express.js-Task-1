const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  users: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  restaurants: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "restaurants",
  },
  riders: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "riders",
  },
  comment: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  time: {
    type: Date,
    required: [true, "Time is not provided"],
  },
});

const ReviewModel = mongoose.model("reviews", reviewSchema);

module.exports = ReviewModel;