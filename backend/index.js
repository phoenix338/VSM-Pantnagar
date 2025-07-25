require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://vsm-pantnagar.vercel.app'
  ],
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

const Book = require('./Book');
const Initiative = require('./Initiative');
const Impact = require('./Impact');
const TeamMember = require('./TeamMember');
const TimelineEvent = require('./TimelineEvent');
const News = require('./News');
const Review = require('./Review');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'initiatives',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
  },
});
const upload = multer({ storage: storage });

// Middleware for admin authentication
function adminAuth(req, res, next) {
  const { email, password } = req.headers;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vsm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

app.get('/', (req, res) => {
  res.send('API is running');
});

// Add a new book (admin only - for now, no auth)
app.post('/books', async (req, res) => {
  try {
    const { title, author, coverImage, description } = req.body;
    const book = new Book({ title, author, coverImage, description });
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get latest 4 books
app.get('/books/latest', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).limit(4);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all books
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all initiatives
app.get('/initiatives', async (req, res) => {
  try {
    const initiatives = await Initiative.find().sort({ createdAt: 1 });
    res.json(initiatives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new initiative (admin only)
app.post('/initiatives', adminAuth, async (req, res) => {
  try {
    console.log('Received body:', req.body);
    const { title, text, imageUrl } = req.body;
    const initiative = new Initiative({ title, text, imageUrl });
    await initiative.save();
    res.status(201).json(initiative);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an initiative (admin only)
app.delete('/initiatives/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Initiative.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get impact values
app.get('/impact', async (req, res) => {
  try {
    let impact = await Impact.findOne();
    if (!impact) {
      impact = new Impact({
        volunteers: '1,500+',
        events: '120+',
        people: '10,000+',
        hours: '17,500+',
        donors: '1,000+',
        years: '25+'
      });
      await impact.save();
    }
    res.json(impact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update impact values (admin only)
app.put('/impact', adminAuth, async (req, res) => {
  try {
    let impact = await Impact.findOne();
    if (!impact) {
      impact = new Impact();
    }
    const { volunteers, events, people, hours, donors, years } = req.body;
    impact.volunteers = volunteers;
    impact.events = events;
    impact.people = people;
    impact.hours = hours;
    impact.donors = donors;
    impact.years = years;
    await impact.save();
    res.json(impact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Image upload endpoint
app.post('/upload-image', adminAuth, upload.single('image'), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ error: 'Image upload failed' });
  }
  res.json({ imageUrl: req.file.path });
});

// Get all team members
app.get('/team', async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: 1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new team member (admin only, with image upload)
app.post('/team', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, designation } = req.body;
    const imageUrl = req.file && req.file.path;
    if (!name || !designation || !imageUrl) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const member = new TeamMember({ name, designation, imageUrl });
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a team member (admin only)
app.put('/team/:id', adminAuth, async (req, res) => {
  try {
    const { name, designation, imageUrl } = req.body;
    const member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { name, designation, imageUrl },
      { new: true }
    );
    if (!member) return res.status(404).json({ error: 'Not found' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a team member (admin only)
app.delete('/team/:id', adminAuth, async (req, res) => {
  try {
    await TeamMember.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all timeline events, sorted by year ascending
app.get('/timeline-events', async (req, res) => {
  try {
    const events = await TimelineEvent.find().sort({ year: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch timeline events' });
  }
});

// Add a timeline event (admin only)
app.post('/timeline-events', adminAuth, async (req, res) => {
  try {
    const { year, label } = req.body;
    if (!year || !label) return res.status(400).json({ error: 'Year and label are required' });
    const event = new TimelineEvent({ year, label });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add timeline event' });
  }
});

// Delete a timeline event (admin only)
app.delete('/timeline-events/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await TimelineEvent.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete timeline event' });
  }
});

// Get all news, sorted by createdAt descending
app.get('/news', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Add news (admin only, with image upload)
app.post('/news', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !req.file || !req.file.path) return res.status(400).json({ error: 'Title and image are required' });
    const imageUrl = req.file.path;
    const news = new News({ title, imageUrl });
    await news.save();
    res.status(201).json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add news' });
  }
});

// Delete news (admin only)
app.delete('/news/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await News.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

// Get all reviews, sorted by createdAt descending
app.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Add review (admin only, with image upload)
app.post('/reviews', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, designation, title, text } = req.body;
    if (!name || !designation || !title || !text || !req.file || !req.file.path) return res.status(400).json({ error: 'All fields and image are required' });
    const imageUrl = req.file.path;
    const review = new Review({ name, designation, title, text, imageUrl });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Delete review (admin only)
app.delete('/reviews/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

