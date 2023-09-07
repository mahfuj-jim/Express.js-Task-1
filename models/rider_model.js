const mongoose = require("mongoose");

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
    },
    {
        timestamps: true,
    });

const RiderModel = mongoose.model("riders", riderSchema);

module.exports = RiderModel;
