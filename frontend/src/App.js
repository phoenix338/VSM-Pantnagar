import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import SignUp from './SignUp';
import Books from './Books';
import AddBook from './AddBook';
import AddGenre from './AddGenre';
import GalleryImages from './GalleryImages';
import Videos from './Videos';
import ContactUs from './ContactUs';
import OurInitiative from './OurInitiative';
import OurImpact from './OurImpact';
import MeetOurTeam from './MeetOurTeam';
import Timeline from './Timeline';
import Events from './Events';
import UpcomingEvents from './UpcomingEvents';
import PreviousEvents from './PreviousEvents';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/books" element={<Books />} />
        <Route path="/admin/add-book" element={<AddBook />} />
        <Route path="/admin/add-genre" element={<AddGenre />} />
        <Route path="/gallery/images" element={<GalleryImages />} />
        <Route path="/gallery/videos" element={<Videos />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/our-initiative" element={<OurInitiative />} />
        <Route path="/our-events" element={<OurInitiative />} />
        <Route path="/our-events/:eventId" element={<OurInitiative />} />
        <Route path="/our-impact" element={<OurImpact />} />
        <Route path="/meet-our-team" element={<MeetOurTeam />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/upcoming" element={<UpcomingEvents />} />
        <Route path="/events/previous" element={<PreviousEvents />} />
      </Routes>
    </Router>
  );
}

export default App;
