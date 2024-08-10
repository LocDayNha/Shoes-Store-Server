const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const imageScheme = mongoose.Schema({
  _id: false,
  url: String,
  name: String,
});

const varianceDetailSchema = mongoose.Schema({
  _id: false,
  size: { type: Number },
  quantity: { type: Number },
});

const varianceSchema = mongoose.Schema({
  _id: false,
  images: [imageScheme],
  colorName: { type: String },
  color: { type: String },
  varianceDetail: [varianceDetailSchema],
});

const productSchema = new Schema({
  id: { type: ObjectId },
  title: { type: String },
  price: { type: Number },
  discount: { type: Number },
  image: { name: String, url: String },
  description: { type: String },
  brand: { type: ObjectId, ref: 'brand' }, //khoá ngoại
  variances: [varianceSchema],
});

module.exports = mongoose.models.product || mongoose.model('product', productSchema);
