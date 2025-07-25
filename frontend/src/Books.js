import React, { useEffect, useState } from 'react';
function Books() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(process.env.REACT_APP_API_URL + '/books')
            .then(res => res.json())
            .then(data => {
                setBooks(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading books...</div>;
    if (!books.length) return <div>No books found.</div>;

    return (
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '32px 0' }}>
            <h2 style={{ fontFamily: 'Arimo, sans-serif', color: '#DD783C', fontWeight: 700, fontSize: 32, marginBottom: 24 }}>All Books</h2>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                {books.map(book => (
                    <div key={book._id} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 20, width: 220, textAlign: 'center' }}>
                        {book.coverImage && <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />}
                        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>{book.title}</div>
                        <div style={{ color: '#904B1C', fontSize: 15, marginBottom: 8 }}>{book.author}</div>
                        <div style={{ fontSize: 14, color: '#444', minHeight: 40 }}>{book.description}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Books; 