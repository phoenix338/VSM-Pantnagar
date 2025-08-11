const mongoose = require('mongoose');

const imagesSubsectionSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('ImagesSubsection', imagesSubsectionSchema);
