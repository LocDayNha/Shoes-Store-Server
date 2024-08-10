const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        require: true
    },
    product: [
        {
            name: {
                type: String,
            },
            quantity: {
                type: Number,
            },
            price: {
                type: String,
            },
            image: {
                type: String,
            }
        },
    ],
    totalPrice: {
        price: Number,
    },
    shippingAdress: [
        {
            mobileNb: {
                type: String,
            },
            houseNb: {
                type: String,
            },
            street: {
                type: String,
            },
            ward: {
                type: String,
            },
            city: {
                type: String,
            },
            countruy: {
                type: String,
            },
            postalCode: {
                type: String,
            },
        }],
    paymentMethod: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;