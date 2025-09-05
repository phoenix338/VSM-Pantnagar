const mongoose = require('mongoose');

const quoteSectionSchema = new mongoose.Schema({
    video: { type: String },  
    image: { type: String },  
}, { timestamps: true });

module.exports = mongoose.model('QuoteSection', quoteSectionSchema);
