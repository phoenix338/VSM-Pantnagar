import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import SignUp from './SignUp';
import Books from './Books';
import AddBook from './AddBook';
import GalleryImages from './GalleryImages';
import OurInitiative from './OurInitiative';
import OurImpact from './OurImpact';
import MeetOurTeam from './MeetOurTeam';
import Timeline from './Timeline';
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
        <Route path="/gallery/images" element={<GalleryImages />} />
        <Route path="/our-initiative" element={<OurInitiative />} />
        <Route path="/our-impact" element={<OurImpact />} />
        <Route path="/meet-our-team" element={<MeetOurTeam />} />
        <Route path="/timeline" element={<Timeline />} />
      </Routes>
    </Router>
  );
}

export default App;
