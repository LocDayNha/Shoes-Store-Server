const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ratingProductSchema = new Schema({
  id: { type: ObjectId },
  idUser: { type: ObjectId, ref: 'user' },
  idOder: { type: ObjectId, ref: 'order' },
  idProduct: { type: ObjectId, ref: 'product' },
  ratingStatus: { type: String },
  star: { type: Number },
  image: { type: String, default: '' },
  video: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  countHearts: { type: Number, default: 0 },
  israting: { type: Boolean, default: false },
  isClicked: {
    type: Boolean,
    default: false,
  },
});

module.exports =
  mongoose.models.ratingProduct || mongoose.model('ratingProduct', ratingProductSchema);
