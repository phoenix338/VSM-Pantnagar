const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    venue: { type: String, required: true },
    googleFormLink: { type: String, required: false },
    bannerImage: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema); 