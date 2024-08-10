const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const favoriteSchema = new Schema({
    id: { type: ObjectId },
    idUser: { type: ObjectId, ref: 'user' },
    idProduct: { type: ObjectId, ref: 'product' },

})
module.exports = mongoose.models.favorite || mongoose.model('favorite', favoriteSchema);