const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: [true, "Name is not provided"],
    maxLength: 30,
  },
  email: {
    type: String,
    required: [true, "Email is not provided"],
  },
  password: {
    type: String,
    required: [true, "Password is not provided"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone Number is not provided"],
  },
  location: {
    type: String,
    required: [true, "Location is not provided"],
  },
  favouriteRestaurant: {
    type: [Number],
    default: [],
  },
});

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
