const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema); 