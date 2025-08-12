const mongoose = require('mongoose');

const patronSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    name: { type: String, required: true },
    designation: { type: String, required: true },
    link: { type: String, required: false },
});

module.exports = mongoose.model('patron', patronSchema); 
