const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ratingSchema = new Schema({
    id: { type: ObjectId },
    idUser: { type: ObjectId, ref: 'user' },
    idOder: { type: ObjectId, ref: 'order' },
    ratingStatus:{type:String},
    star:{type:Number},
    image: { type: String, default:''},
    video: { type: String, default:''},
});

module.exports = mongoose.models.rating ||  mongoose.model('rating', ratingSchema);