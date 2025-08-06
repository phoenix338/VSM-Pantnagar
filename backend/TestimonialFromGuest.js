const mongoose = require('mongoose');

const testimonialFromGuestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestimonialFromGuest', testimonialFromGuestSchema);
