const mongoose = require('mongoose');

const OtherImagesSchema = new mongoose.Schema({
    subsection: {
        type: String,
        required: true,
        trim: true
    },
    urls: [{ type: String, required: true }], 
}, { timestamps: true });

module.exports = mongoose.model('OtherImages', OtherImagesSchema);