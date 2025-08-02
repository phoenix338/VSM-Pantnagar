import React, { useEffect, useState } from 'react';
import './LatestBooks.css';

function LatestBooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
        fetch(`${API_URL}/books`)
            .then(res => res.json())
            .then(data => {
                setBooks(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading latest books...</div>;
    if (!books.length) return <div>No books found.</div>;

    return (
        <div className="latest-books-container">
            <h2 className="latest-books-title">Latest Books</h2>
            <div className="latest-books-scroll">
                {books.map(book => (
                    <div key={book._id} className="book-card">
                        {book.coverImage && <img src={book.coverImage} alt={book.title} className="book-cover" />}
                        <div className="book-title">{book.title}</div>
                        <div className="book-author">{book.author}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LatestBooks; 