import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/UploadPage.css';

const UploadPage = () => {
    const [title, setTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tags, setTags] = useState([]);
    const [currentCharacter, setCurrentCharacter] = useState('waldo');
    const navigate = useNavigate();
    const imageRef = useRef(null);

    // Check if user is author
    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'author') {
            navigate('/');
        }
    }, [navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleImageClick = (e) => {
        if (tags.length >= 3) {
            setError('All characters have been placed');
            return;
        }

        const rect = imageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const characters = ['waldo', 'wilma', 'wizard'];
        const currentChar = characters[tags.length];

        setTags([...tags, { character: currentChar, x, y }]);
        setCurrentCharacter(characters[tags.length + 1] || null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (tags.length !== 3) {
            setError('Please mark all three characters before uploading');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('image', selectedFile);
            formData.append('authorId', localStorage.getItem('userId'));
            formData.append('tags', JSON.stringify(tags));

            await axios.post('http://localhost:5001/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            navigate('/dashboard');
        } catch (err) {
            setError('Failed to upload image. Please try again.');
            console.error('Upload error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-container">
            <h1>Upload New Image</h1>
            <form onSubmit={handleSubmit} className="upload-form">
                <div className="form-group">
                    <label htmlFor="title">Image Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="image">Select Image</label>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                    />
                </div>

                {previewUrl && (
                    <div className="image-preview">
                        <h3>Click to mark character positions:</h3>
                        <p className="character-instruction">
                            Currently placing: {currentCharacter || 'All characters placed'}
                        </p>
                        <div className="image-container">
                            <img
                                ref={imageRef}
                                src={previewUrl}
                                alt="Preview"
                                onClick={handleImageClick}
                            />
                            {tags.map((tag, index) => (
                                <div
                                    key={index}
                                    className="tag-marker"
                                    style={{
                                        left: `${tag.x}px`,
                                        top: `${tag.y}px`,
                                    }}
                                >
                                    {tag.character}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}
                
                <button type="submit" disabled={loading || tags.length !== 3}>
                    {loading ? 'Uploading...' : 'Upload Image'}
                </button>
            </form>
        </div>
    );
};

export default UploadPage;