const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const orderDetailSchema = new Schema({
  _id: false,
  productId: { type: ObjectId, ref: 'product' },
  unitPrice: { type: Number },
  quantity: { type: Number },
  color: { type: String },
  size: { type: Number },
});

const orderSchema = new Schema(
  {
    id: { type: ObjectId },
    userId: { type: ObjectId, ref: 'user' },
    detail: [orderDetailSchema],
    status: { type: String },
    isPaid: { type: Boolean, default: false },
    totalAmount: { type: Number },
    uuid: { type: String },
    paymentTransactionRef: { type: String },
    address: { type: String },
    phoneNumber: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.models.order || mongoose.model('order', orderSchema);
