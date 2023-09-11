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

const riderSchema = new mongoose.Schema(
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
    nidNumber: {
      type: String,
      unique: true,
      required: [true, "NID number is not provided"],
    },
    isActive: {
      type: Boolean,
      required: [true, "IsActive is not provided"],
    },
    isEngaged: {
      type: Boolean,
      required: [true, "IsEngaged is not provided"],
    },
    rating: Number,
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);

const RiderModel = mongoose.model("riders", riderSchema);

module.exports = RiderModel;
