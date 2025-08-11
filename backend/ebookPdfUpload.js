const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ebooks',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
  },
});
const upload = multer({ storage });

router.post('/', upload.single('pdf'), (req, res) => {
  if (!req.file || !req.file.path) return res.status(400).json({ error: 'PDF is required' });
  res.status(201).json({ pdfUrl: req.file.path });
});

module.exports = router;
