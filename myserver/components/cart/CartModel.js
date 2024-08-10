const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const cartSchema = new Schema({
  id: { type: ObjectId },
  idUser: { type: ObjectId, ref: 'user' },
  idProduct: { type: ObjectId, ref: 'product' },
  color: { type: String },
  size: { type: Number },
  quantity: { type: Number },
});
module.exports = mongoose.models.cart || mongoose.model('cart', cartSchema);
