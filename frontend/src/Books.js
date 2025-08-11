import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from './firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import './Books.css';
import booksGif from './assets/books.gif';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const Books = () => {
    const [genres, setGenres] = useState([]);
    const [books, setBooks] = useState([]);
    const [selectedBooks, setSelectedBooks] = useState({}); // Changed state
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedBookForModal, setSelectedBookForModal] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [bookPreviewModal, setBookPreviewModal] = useState({ show: false, book: null, genreId: null, currentPage: 1, totalPages: 1 });

    useEffect(() => {
        fetchGenres();
        fetchBooks();
        const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (genres.length > 0 && books.length > 0) {
            const newSelectedBooks = {};
            genres.forEach(genre => {
                const genreBooks = books.filter(book => book.genre && book.genre._id === genre._id);
                if (genreBooks.length > 0) {
                    const mainBook = genreBooks.find(book => book.isMainBook) || genreBooks[0];
                    newSelectedBooks[genre._id] = mainBook;
                }
            });
            setSelectedBooks(newSelectedBooks);
        }
    }, [genres, books]);

    const fetchGenres = async () => {
        try {
            const res = await fetch(`${API_URL}/genres`);
            const data = await res.json();
            setGenres(data);
        } catch (err) {
            console.error('Error fetching genres:', err);
        }
    };

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/books`);
            const data = await res.json();
            setBooks(data);
        } catch (err) {
            console.error('Error fetching books:', err);
        }
        setLoading(false);
    };

    const isAdmin = user && user.email === ADMIN_EMAIL;

    const handleBookClick = (genreId, book) => {
        setSelectedBooks(prev => ({
            ...prev,
            [genreId]: book
        }));
        // Show preview modal in place of genre icon
        const wordsPerPage = 55;
        const words = book.previewDescription ? book.previewDescription.split(' ') : [];
        setBookPreviewModal({
            show: true,
            book,
            genreId,
            currentPage: 1,
            totalPages: Math.max(1, Math.ceil(words.length / wordsPerPage))
        });
    };

    const closeBookPreviewModal = () => {
        setBookPreviewModal({ show: false, book: null, genreId: null, currentPage: 1, totalPages: 1 });
    };

    const nextBookPreviewPage = () => {
        setBookPreviewModal(prev => prev.currentPage < prev.totalPages ? { ...prev, currentPage: prev.currentPage + 1 } : prev);
    };

    const prevBookPreviewPage = () => {
        setBookPreviewModal(prev => prev.currentPage > 1 ? { ...prev, currentPage: prev.currentPage - 1 } : prev);
    };

    const deleteGenre = async (genreId) => {
        if (!window.confirm('Are you sure you want to delete this genre? This will also delete all books in this genre.')) {
            return;
        }

        try {
            const adminPassword = prompt('Enter admin password:');
            if (!adminPassword) throw new Error('Password is required');

            const res = await fetch(`${API_URL}/genres/${genreId}`, {
                method: 'DELETE',
                headers: {
                    'email': user.email,
                    'password': adminPassword
                }
            });

            if (res.ok) {
                // Refresh genres and books
                fetchGenres();
                fetchBooks();
            } else {
                alert('Failed to delete genre');
            }
        } catch (err) {
            console.error('Error deleting genre:', err);
            alert('Failed to delete genre');
        }
    };

    const deleteSelectedBook = async (bookId) => {
        if (!window.confirm('Are you sure you want to delete this book?')) {
            return;
        }

        try {
            const adminPassword = prompt('Enter admin password:');
            if (!adminPassword) throw new Error('Password is required');

            const res = await fetch(`${API_URL}/books/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'email': user.email,
                    'password': adminPassword
                }
            });

            if (res.ok) {
                // Refresh books
                fetchBooks();
            } else {
                alert('Failed to delete book');
            }
        } catch (err) {
            console.error('Error deleting book:', err);
            alert('Failed to delete book');
        }
    };

    const getGenreBooks = (genreId) => { // Modified signature
        return books.filter(book => book.genre && book.genre._id === genreId);
    };

    const convertTextToLinks = (text) => {
        if (!text) return '';
        // Replace 'Available on VSM Motivation' with a link
        const regex = /(Available on VSM Motivation)/g;
        return text.split(regex).map((part, idx) => {
            if (part === 'Available on VSM Motivation') {
                return <a key={idx} href="https://vsmmotivation.in/" target="_blank" rel="noopener noreferrer" style={{ color: '#ff9800', textDecoration: 'none' }}>Available on VSM Motivation</a>;
            }
            return part;
        });
    };

    // Fix: Ensure handleMainBookClick and closeModal are defined
    const handleMainBookClick = (book) => {
        setSelectedBookForModal(book);
        setShowModal(true);
        setCurrentPage(1);
        // Calculate total pages based on description length
        const wordsPerPage = 55;
        const words = book.previewDescription ? book.previewDescription.split(' ') : [];
        setTotalPages(Math.max(1, Math.ceil(words.length / wordsPerPage)));
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedBookForModal(null);
        setCurrentPage(1);
    };

    if (loading) return (
        <>
            <Navbar />
            <div className="books-loading">Loading books...</div>
            <Footer />
        </>
    );

    return (
        <>
            <Navbar />
            <div className="books-page main-content-gap">
                <div className="books-gif-wrapper">
                    <img src={booksGif} alt="Books" className="books-gif" />
                </div>
                <h1 className="books-heading">Our Publications</h1>
                <div className="books-content">


                    {/* Genre Sections */}
                    <div className="genres-sections">
                        {genres.map((genre, index) => {
                            const genreBooks = getGenreBooks(genre._id);
                            const selectedBook = selectedBooks[genre._id];
                            const isEven = index % 2 === 1; // 0-based index, so odd numbers are even genres

                            // If no books in genre, skip
                            if (genreBooks.length === 0) return null;

                            // Only show preview modal when a book is clicked from the side scrollbar
                            const showPreview = bookPreviewModal.show && bookPreviewModal.genreId === genre._id;
                            const previewBook = showPreview ? bookPreviewModal.book : null;
                            // Remove localPage state and related logic
                            const previewCurrentPage = showPreview ? bookPreviewModal.currentPage : 1;
                            const previewWords = previewBook && previewBook.previewDescription ? previewBook.previewDescription.split(' ') : [];
                            const previewWordsPerPage = 120;
                            const previewTotalPages = Math.max(1, Math.ceil(previewWords.length / previewWordsPerPage));

                            return (
                                <div key={genre._id}>
                                    <div className="genre-section">
                                        {/* Genre Title with Genre Image beside it */}
                                        <div className="genre-section-title" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <h2 style={{ color: 'grey', margin: 0, fontSize: '2rem', fontWeight: '400', fontFamily: 'alex brush' }}>{genre.name}</h2>
                                            {/* <img src={genre.image} alt={genre.name} style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '12px' }} /> */}
                                            {isAdmin && (
                                                <button
                                                    className="delete-genre-btn"
                                                    onClick={() => deleteGenre(genre._id)}
                                                    title="Delete Genre"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>

                                        <div className={`genre-section-content ${isEven ? 'reversed' : ''}`}>
                                            {/* Book Preview Modal-in-place (no cross icon, no genre image here) */}
                                            <div className="genre-image-left" style={{ position: 'relative', height: '100%' }}>
                                                {showPreview && previewBook ? (
                                                    <div className="book-preview-modal-inplace">
                                                        <div className="book-modal-content">
                                                            <div className="book-modal-info">
                                                                <p className="book-modal-description">
                                                                    {(() => {
                                                                        if (!previewBook.previewDescription) return '';
                                                                        const startIdx = (previewCurrentPage - 1) * previewWordsPerPage;
                                                                        const endIdx = startIdx + previewWordsPerPage;
                                                                        return convertTextToLinks(previewWords.slice(startIdx, endIdx).join(' '));
                                                                    })()}
                                                                </p>
                                                            </div>
                                                            <div className="book-modal-pagination unified-pagination-width" style={{ marginTop: '8px' }}>
                                                                <button
                                                                    className="pagination-btn prev-btn"
                                                                    onClick={prevBookPreviewPage}
                                                                    disabled={previewCurrentPage === 1}
                                                                >
                                                                    ‹
                                                                </button>
                                                                <span className="pagination-text">{previewCurrentPage}/{previewTotalPages}</span>
                                                                <button
                                                                    className="pagination-btn next-btn"
                                                                    onClick={nextBookPreviewPage}
                                                                    disabled={previewCurrentPage === previewTotalPages}
                                                                >
                                                                    ›
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>

                                            {/* Selected Book */}
                                            <div className="selected-book-area">
                                                {selectedBook && (
                                                    <>
                                                        <div className="book-cover">
                                                            <img src={selectedBook.frontPageImage} alt={selectedBook.title} />
                                                            {isAdmin && (
                                                                <button
                                                                    className="delete-book-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteSelectedBook(selectedBook._id);
                                                                    }}
                                                                    title="Delete Book"
                                                                >
                                                                    ×
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="book-description">
                                                            <h3>{selectedBook.title}</h3>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Scrollable Books List */}
                                            <div className="books-scrollable-list">
                                                <div className={`books-list-container ${isEven ? 'reverse' : ''}`}>
                                                    {genreBooks.map(book => (
                                                        <div
                                                            key={book._id}
                                                            className={`scrollable-book-item ${selectedBook?._id === book._id ? 'active' : ''}`}
                                                            onClick={() => handleBookClick(genre._id, book)}
                                                        >
                                                            <div className="book-thumbnail">
                                                                <img src={book.frontPageImage} alt={book.title} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add horizontal line after each genre (except the last one) */}
                                    {index < genres.length - 1 && (
                                        <div className="genre-divider">
                                            <hr />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Remove the old divider section */}
                    <div className="books-header">
                        {isAdmin && (
                            <div className="admin-links">
                                <Link to="/admin/add-genre" className="admin-link">Add Genre</Link>
                                <Link to="/admin/add-book" className="admin-link">Add Book</Link>
                            </div>
                        )}
                    </div>
                    {genres.length === 0 && (
                        <div className="no-genres">
                            <p>No genres available. Please add some genres first.</p>
                            {isAdmin && (
                                <Link to="/admin/add-genre" className="admin-link">Add Your First Genre</Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Book Preview Modal */}
                {showModal && selectedBookForModal && (
                    <div className="book-modal-overlay" onClick={closeModal}>
                        <div className="book-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="book-modal-close" onClick={closeModal}>×</button>
                            <div className="book-modal-content">
                                <div className="book-modal-info">
                                    <p className="book-modal-description">
                                        {(() => {
                                            if (!selectedBookForModal.previewDescription) return '';
                                            const words = selectedBookForModal.previewDescription.split(' ');
                                            const wordsPerPage = 55;
                                            const startIdx = (currentPage - 1) * wordsPerPage;
                                            const endIdx = startIdx + wordsPerPage;
                                            // Join the page's words and convert to links
                                            return convertTextToLinks(words.slice(startIdx, endIdx).join(' '));
                                        })()}
                                    </p>
                                </div>
                                <div className="book-modal-pagination unified-pagination-width">
                                    <button
                                        className="pagination-btn prev-btn"
                                        onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                                        disabled={currentPage === 1}
                                    >
                                        ‹
                                    </button>
                                    <span className="pagination-text">{currentPage}/{totalPages}</span>
                                    <button
                                        className="pagination-btn next-btn"
                                        onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                        disabled={currentPage === totalPages}
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <Footer />
                {/* Responsive spacing for main content */}
                <style>{`
                  @media (max-width: 600px) {
                    .main-content-gap {
                      margin-top: 100px !important;
                    }
                  }
                  @media (min-width: 601px) {
                    .main-content-gap {
                      margin-top: 60px !important;
                    }
                  }
                `}</style>
            </div>
        </>
    );
};

export default Books;