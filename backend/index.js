require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://vsm-pantnagar.vercel.app'
  ],
}));
app.use(express.json());

const PORT = process.env.PORT || 3002;

const Book = require('./Book');
const Initiative = require('./Initiative');
const Impact = require('./Impact');
const TeamMember = require('./TeamMember');
const TimelineEvent = require('./TimelineEvent');
const Event = require('./Event');
const News = require('./News');
const Review = require('./Review');
const GalleryImage = require('./GalleryImage');
const Genre = require('./Genre');
const Video = require('./Video');
const Resource = require('./Resource');
const TestimonialFromGuest = require('./TestimonialFromGuest');
const EventReview = require('./EventReview');

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

// Test contact endpoint
app.get('/contact-test', (req, res) => {
  res.json({
    message: 'Contact endpoint is working',
    emailConfig: {
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS,
      hasContactEmail: !!process.env.CONTACT_EMAIL
    }
  });
});


// Get all initiatives
app.get('/initiatives', async (req, res) => {
  try {
    const initiatives = await Initiative.find().sort({ createdAt: 1 });

    // Handle backward compatibility for old imageUrl format
    const processedInitiatives = initiatives.map(initiative => {
      const initiativeObj = initiative.toObject();

      // If imageUrls doesn't exist but imageUrl does, convert to new format
      if (!initiativeObj.imageUrls && initiativeObj.imageUrl) {
        initiativeObj.imageUrls = [initiativeObj.imageUrl];
        delete initiativeObj.imageUrl;
      }

      // If neither exists, provide empty array
      if (!initiativeObj.imageUrls) {
        initiativeObj.imageUrls = [];
      }

      return initiativeObj;
    });

    res.json(processedInitiatives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new initiative (admin only)
app.post('/initiatives', adminAuth, async (req, res) => {
  try {
    console.log('Received body:', req.body);
    const { title, text, imageUrls } = req.body;
    const initiative = new Initiative({ title, text, imageUrls });
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

// Models
const ImagesSubsection = require('./ImagesSubsection');

// Add new subsection (admin only)
app.post('/images-subsections', adminAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const subsection = new ImagesSubsection({ name });
    await subsection.save();
    res.status(201).json(subsection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all subsections
app.get('/images-subsections', async (req, res) => {
  try {
    const subsections = await ImagesSubsection.find().sort({ name: 1 });
    res.json(subsections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const OtherImages = require('./OtherImages');

// Get all other images entries
app.get('/other-images', async (req, res) => {
  try {
    const otherImagesEntries = await OtherImages.find().sort({ createdAt: -1 });
    res.json(otherImagesEntries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new other images entry (admin only)
app.post('/other-images', adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    const { subsection } = req.body;
    if (!subsection) {
      return res.status(400).json({ error: 'Subsection name is required' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    // Extract URLs from uploaded files (Cloudinary or wherever)
    const urls = req.files.map(file => file.path);

    const newEntry = new OtherImages({ subsection, urls });
    await newEntry.save();

    res.status(201).json(newEntry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an other images entry by id (admin only)
app.delete('/other-images/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await OtherImages.findByIdAndDelete(id);
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

// Multiple images upload endpoint
app.post('/upload-multiple-images', adminAuth, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No images uploaded' });
  }
  const imageUrls = req.files.map(file => file.path);
  res.json({ imageUrls });
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
    const { name, designation, email, contactNumber } = req.body;
    const imageUrl = req.file && req.file.path;
    if (!name || !designation || !imageUrl) {
      return res.status(400).json({ error: 'Name, designation and image are required' });
    }
    const member = new TeamMember({ name, designation, email, contactNumber, imageUrl });
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a team member (admin only)
app.put('/team/:id', adminAuth, async (req, res) => {
  try {
    const { name, designation, email, contactNumber, imageUrl } = req.body;
    const member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { name, designation, email, contactNumber, imageUrl },
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

// Add review (admin only, with optional image upload)
app.post('/reviews', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, designation, text } = req.body;
    if (!name || !designation || !text) return res.status(400).json({ error: 'Name, designation and text are required' });

    // Use a default image if no image is uploaded
    const imageUrl = req.file ? req.file.path : '/uploads/default-testimonial.jpg';

    const review = new Review({ name, designation, text, imageUrl });
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

// Get all gallery images, sorted by createdAt descending
app.get('/gallery-images', async (req, res) => {
  try {
    const galleryImages = await GalleryImage.find().sort({ createdAt: -1 });
    res.json(galleryImages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

// Add gallery image (admin only, with image upload)
app.post('/gallery-images', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description || !req.file || !req.file.path) return res.status(400).json({ error: 'Title, description and image are required' });
    const imageUrl = req.file.path;
    const galleryImage = new GalleryImage({ title, description, imageUrl });
    await galleryImage.save();
    res.status(201).json(galleryImage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add gallery image' });
  }
});

// Delete gallery image (admin only)
app.delete('/gallery-images/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await GalleryImage.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete gallery image' });
  }
});

// Get all events, sorted by createdAt descending
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get upcoming events (events with date >= today)
app.get('/events/upcoming', async (req, res) => {
  try {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    const events = await Event.find().sort({ date: 1 });
    const upcomingEvents = events.filter(event => {
      // Parse event date and compare with today
      const eventDate = new Date(event.date);
      return eventDate >= today;
    });

    res.json(upcomingEvents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
});

// Get previous events (events with date < today)
app.get('/events/previous', async (req, res) => {
  try {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    const events = await Event.find().sort({ date: -1 });
    const previousEvents = events.filter(event => {
      // Parse event date and compare with today
      const eventDate = new Date(event.date);
      return eventDate < today;
    });

    res.json(previousEvents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch previous events' });
  }
});

// Add event (admin only, with image upload)
app.post('/events', adminAuth, upload.single('bannerImage'), async (req, res) => {
  try {
    const { title, date, venue, googleFormLink } = req.body;
    if (!title || !date || !venue || !googleFormLink || !req.file || !req.file.path) {
      return res.status(400).json({ error: 'All fields and banner image are required' });
    }
    const bannerImage = req.file.path;
    const event = new Event({ title, date, venue, googleFormLink, bannerImage });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add event' });
  }
});

// Delete event (admin only)
app.delete('/events/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get all genres
app.get('/genres', async (req, res) => {
  try {
    const genres = await Genre.find().sort({ createdAt: 1 });
    res.json(genres);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

// Add genre (admin only, with image upload)
app.post('/genres', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !req.file || !req.file.path) {
      return res.status(400).json({ error: 'Name and image are required' });
    }
    const image = req.file.path;
    const genre = new Genre({ name, image });
    await genre.save();
    res.status(201).json(genre);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add genre' });
  }
});

// Delete genre (admin only)
app.delete('/genres/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // First delete all books associated with this genre
    await Book.deleteMany({ genre: id });

    // Then delete the genre
    await Genre.findByIdAndDelete(id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete genre' });
  }
});

// Get all books with genre information
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find().populate('genre').sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get books by genre
app.get('/books/genre/:genreId', async (req, res) => {
  try {
    const { genreId } = req.params;
    const books = await Book.find({ genre: genreId }).populate('genre').sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books by genre' });
  }
});

// Add book (admin only, with image upload)
app.post('/books', adminAuth, upload.single('frontPageImage'), async (req, res) => {
  try {
    const { title, genre, previewDescription, isMainBook } = req.body;
    if (!title || !genre || !previewDescription || !req.file || !req.file.path) {
      return res.status(400).json({ error: 'All fields and front page image are required' });
    }
    const frontPageImage = req.file.path;
    const book = new Book({ title, genre, previewDescription, frontPageImage, isMainBook: isMainBook === 'true' });
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// Delete book (admin only)
app.delete('/books/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Book.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// Get all videos
app.get('/videos', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Add video (admin only)
app.post('/videos', adminAuth, async (req, res) => {
  try {
    const { title, videoUrl } = req.body;
    if (!title || !videoUrl) {
      return res.status(400).json({ error: 'Title and video URL are required' });
    }
    const video = new Video({ title, videoUrl });
    await video.save();
    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add video' });
  }
});

// Delete video (admin only)
app.delete('/videos/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Video.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Get all resources (five sections)
const TalksByDignitary = require('./TalksByDignitary');
const UniqueIndiaResource = require('./UniqueIndiaResource');
const MiscResource = require('./MiscResource');
const EBook = require('./EBook');
const ENewsletter = require('./ENewsletter');
const ebookPdfUpload = require('./ebookPdfUpload');

// PDF upload endpoint for eBooks
app.use('/upload-ebook-pdf', ebookPdfUpload);

// PDF upload endpoint for eNewsletters (reuse logic, different folder)
const enewsletterPdfUpload = express.Router();
const enewsletterStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'enewsletters',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
  },
});
const enewsletterUpload = multer({ storage: enewsletterStorage });
enewsletterPdfUpload.post('/', enewsletterUpload.single('pdf'), (req, res) => {
  if (!req.file || !req.file.path) return res.status(400).json({ error: 'PDF is required' });
  res.status(201).json({ pdfUrl: req.file.path });
});
app.use('/upload-enewsletter-pdf', enewsletterPdfUpload);

app.get('/resources', async (req, res) => {
  try {
    const [talksByDignitaries, uniqueIndia, miscellaneous, eBooks, eNewsletters] = await Promise.all([
      TalksByDignitary.find().sort({ createdAt: -1 }),
      UniqueIndiaResource.find().sort({ createdAt: -1 }),
      MiscResource.find().sort({ createdAt: -1 }),
      EBook.find().sort({ createdAt: -1 }),
      ENewsletter.find().sort({ createdAt: -1 })
    ]);
    res.json({ talksByDignitaries, uniqueIndia, miscellaneous, eBooks, eNewsletters });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Add eBook
app.post('/ebooks', adminAuth, async (req, res) => {
  try {
    const { title, pdfUrl } = req.body;
    if (!title || !pdfUrl) {
      return res.status(400).json({ error: 'Title and PDF URL are required for eBook.' });
    }
    const ebook = new EBook({ title, pdfUrl });
    await ebook.save();
    res.status(201).json(ebook);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add eBook' });
  }
});

// Add eNewsletter
app.post('/enewsletters', adminAuth, async (req, res) => {
  try {
    const { title, pdfUrl } = req.body;
    if (!title || !pdfUrl) {
      return res.status(400).json({ error: 'Title and PDF URL are required for eNewsletter.' });
    }
    const enewsletter = new ENewsletter({ title, pdfUrl });
    await enewsletter.save();
    res.status(201).json(enewsletter);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add eNewsletter' });
  }
});
// Get all eNewsletters
app.get('/enewsletters', async (req, res) => {
  try {
    const enewsletters = await ENewsletter.find().sort({ createdAt: -1 });
    res.json(enewsletters);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch eNewsletters' });
  }
});

// Add resource (admin only, to correct section)
app.post('/resources', adminAuth, async (req, res) => {
  try {
    const { section, title, url, designation } = req.body;
    let resource;
    if (section === 'talksByDignitaries') {
      if (!title || !url || !designation) {
        return res.status(400).json({ error: 'Title, URL, and designation are required for Talks by Dignitaries.' });
      }
      resource = new TalksByDignitary({ title, url, designation });
    } else if (section === 'uniqueIndia') {
      if (!title || !url) {
        return res.status(400).json({ error: 'Title and URL are required for The Unique India.' });
      }
      resource = new UniqueIndiaResource({ title, url });
    } else if (section === 'miscellaneous') {
      if (!title || !url) {
        return res.status(400).json({ error: 'Title and URL are required for Miscellaneous.' });
      }
      resource = new MiscResource({ title, url });
    } else {
      return res.status(400).json({ error: 'Invalid section.' });
    }
    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add resource' });
  }
});


// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Contact form endpoint
// Guest testimonial submission endpoint
// Get all guest testimonials
app.get('/guest-testimonials', async (req, res) => {
  try {
    const testimonials = await TestimonialFromGuest.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guest testimonials' });
  }
});

app.post('/guest-testimonials', async (req, res) => {
  try {
    const { name, designation, text } = req.body;
    if (!name || !designation || !text) {
      return res.status(400).json({ error: 'Name, designation, and testimonial text are required.' });
    }
    const testimonial = new TestimonialFromGuest({ name, designation, text });
    await testimonial.save();
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit testimonial.' });
  }
});
// Submit a new event review (logged-in user)
app.post('/event-reviews', async (req, res) => {
  try {
    const { eventId, name, collegeOrOccupation, text } = req.body;

    if (!eventId || !name || !collegeOrOccupation || !text) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const review = new EventReview({
      eventId,
      name,
      collegeOrOccupation,
      text,
      status: 'pending',
    });

    await review.save();
    res.status(201).json({ message: 'Review submitted for approval' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/event-reviews', async (req, res) => {
  try {
    const reviews = await EventReview.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get approved event reviews (signed-in users)
// Get ALL reviews for a specific event (no restrictions)
app.get('/event-reviews/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const reviews = await EventReview.find({ eventId }).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Get all event reviews (admin)
app.get('/event-reviews/admin/:eventId', adminAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const reviews = await EventReview.find({ eventId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve event review (admin)
app.patch('/event-reviews/:reviewId/approve', adminAuth, async (req, res) => {
  try {
    await EventReview.findByIdAndUpdate(req.params.reviewId, { status: 'approved' });
    res.json({ message: 'Review approved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject event review (admin)
app.patch('/event-reviews/:reviewId/reject', adminAuth, async (req, res) => {
  try {
    await EventReview.findByIdAndUpdate(req.params.reviewId, { status: 'rejected' });
    res.json({ message: 'Review rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log('Contact form submission:', { name, email, subject, message });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email configuration is set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured. Logging contact form data to console:');
      console.log('Name:', name);
      console.log('Email:', email);
      console.log('Subject:', subject);
      console.log('Message:', message);
      return res.json({ success: true, message: 'Message received! (Email service not configured - check server logs)' });
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER, // Send to admin email
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr>
        <p><em>This message was sent from the VSM Pantnagar contact form.</em></p>
      `
    };

    console.log('Sending email to:', mailOptions.to);

    // Send email
    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully');
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

