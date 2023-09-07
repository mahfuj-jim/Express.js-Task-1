const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
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
});

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is not provided"],
      maxLength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is not provided"],
      unique: true,
    },
    contactNumber: {
      type: String,
      required: [true, "Contact Number is not provided"],
    },
    location: {
      type: String,
      required: [true, "Location is not provided"],
    },
    openHours: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Open hours are not provided"],
    },
    deliveryOptions: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Delivery Options are not provided"],
    },
    cuisine: {
      type: String,
      required: [true, "Cuisine is not provided"],
    },
    owner: {
      type: String,
      required: [true, "Owner is not provided"],
    },
    menu: [mongoose.Schema.Types.Mixed],
    rating: Number,
    reviews: [reviewSchema],
    website: String,
  },
  {
    timestamps: true,
  }
);

const RestaurantModel = mongoose.model("restaurants", restaurantSchema);

module.exports = RestaurantModel;