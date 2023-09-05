const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is not provided"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is not provided"],
  },
  role: {
    type: Number,
    enum: [1, 2], // 1 for user, 2 for restaurant
    required: [true, "Role is not provided"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", 
    required: function () {
      return this.role === 1; 
    },
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "restaurants", 
    required: function () {
      return this.role === 2; 
    },
  },
});

const AuthModel = mongoose.model("auth", authSchema);

module.exports = AuthModel;
