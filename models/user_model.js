const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is not provided"],
      maxLength: 30,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is not provided"],
      validate: {
        validator: function (value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Invalid email format",
      },
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: [true, "Phone Number is not provided"],
      validate: {
        validator: function (value) {
          const phoneNumberRegex = /^\d{11}$/;
          return phoneNumberRegex.test(value);
        },
        message: "Invalid phone number format (must be 11 digits)",
      },
    },
    location: {
      type: String,
      required: [true, "Location is not provided"],
    },
    favouriteRestaurant: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
