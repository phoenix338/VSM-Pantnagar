const mongoose = require('mongoose');

const initiativeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    text: { type: String, required: true },
    imageUrls: [{ type: String, required: true }], // Array of image URLs
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Initiative', initiativeSchema); 