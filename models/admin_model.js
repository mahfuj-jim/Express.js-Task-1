const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
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
        securityKey: {
            type: String,
            required: [true, "Security Key is not provided"]
        },
        superAdmin: {
            type: Boolean,
            required: [true, "Super Admin is not provided"]
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

const AdminModel = mongoose.model("admin", adminSchema);

module.exports = AdminModel;