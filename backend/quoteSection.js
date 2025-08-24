const mongoose = require('mongoose');

const quoteSectionSchema = new mongoose.Schema({
    video: { type: String },  // for storing the uploaded video link
    image: { type: String },  // for storing the uploaded image link
}, { timestamps: true });

module.exports = mongoose.model('QuoteSection', quoteSectionSchema);
