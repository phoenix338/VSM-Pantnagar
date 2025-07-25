import React from 'react';
import Navbar from './Navbar';
import './GalleryImages.css';

// Dynamically import all images from assets/gallery
function importAll(r) {
    return r.keys().map(r);
}
const images = importAll(require.context('./assets/gallery', false, /\.(png|jpe?g|svg)$/));

// Example data: add name/title for each image as needed
const galleryData = images.map((img, idx) => {
    if (idx === 0) {
        return {
            src: img,
            name: 'Dr. Raka Arya',
            title: 'Professor, National Law Institute University, Bhopal',
        };
    }
    return { src: img, name: '', title: '' };
});

const GalleryImages = () => (
    <>
        <Navbar />
        <div className="gallery-page">
            <h1 className="gallery-heading">Gallery</h1>
            <div className="gallery-grid">
                {galleryData.map((item, idx) => (
                    <div className="gallery-img-container" key={idx}>
                        <div className="gallery-img-wrapper">
                            <img src={item.src} alt={`Gallery ${idx + 1}`} className="gallery-img" />
                        </div>
                        {(item.name || item.title) && (
                            <div className="gallery-img-overlay">
                                {item.name && <div className="gallery-name">{item.name}</div>}
                                {item.title && <div className="gallery-title">{item.title}</div>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </>
);

export default GalleryImages; 