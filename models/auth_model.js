const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
    {
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
        password: {
            type: String,
            required: [true, "Password is not provided"]
        },
        verified: {
            type: Boolean,
            required: [true, "Verified is not provided"],
        },
        role: {
            type: Number,
            enum: [1, 2, 3], // 1 for user, 2 for restaurant, 3 for rider
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
        rider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "riders",
            required: function () {
                return this.role === 3;
            },
        },
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lastLoginAttempt: {
            type: Date,
            default: null,
        },
        blockUntil: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const AuthModel = mongoose.model("auths", authSchema);

module.exports = AuthModel;