const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre', required: true },
    frontPageImage: { type: String, required: true },
    previewDescription: { type: String, required: true },
    isMainBook: { type: Boolean, default: false }, // To identify the main book for center display
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', bookSchema); 