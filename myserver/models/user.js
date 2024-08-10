const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    address: [
        {
            mobileNb: Number,
            houseNb: String,
            street: String,
            ward: String,
            city: String,
            country: String,
            postalCode: String,
        },
    ],
    orders: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Order"
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User
