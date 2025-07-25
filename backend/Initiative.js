const mongoose = require('mongoose');

const initiativeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    text: { type: String, required: true },
    imageUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Initiative', initiativeSchema); 