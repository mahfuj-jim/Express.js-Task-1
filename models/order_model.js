const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        time: {
            type: Date,
            required: [true, "Time is not provided"],
        },
        orderStatus: {
            type: String,
            enum: ["Pending", "Processing", "Delivered", "Cancelled"],
            required: [true, "Order status is not provided"],
        },
        deliveryFee: {
            type: Number,
            required: [true, "Delivery fee is not provided"],
        },
        orderList: {
            type: [
                {
                    dishName: {
                        type: String,
                        required: [true, "Dish name is required"],
                    },
                    quantity: {
                        type: Number,
                        required: [true, "Quantity is required"],
                    },
                    price: {
                        type: Number,
                        required: [true, "Price is required"],
                    },
                },
            ],
            required: [true, "Order list is not provided"],
        },
        location: {
            type: String,
            required: [true, "Location is not provided"],
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Restaurant is not provided"],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "User is not provided"],
        },
        rider: {
            type: mongoose.Schema.Types.ObjectId,
        },
    },
    {
        timestamps: true,
    }
);

const OrderModel = mongoose.model("orders", orderSchema);

module.exports = OrderModel;
