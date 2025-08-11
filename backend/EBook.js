const mongoose = require('mongoose');

const eBookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pdfUrl: { type: String, required: true }, // URL to the PDF file
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EBook', eBookSchema);
