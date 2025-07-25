const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
    year: { type: Number, required: true },
    label: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TimelineEvent', timelineEventSchema); 