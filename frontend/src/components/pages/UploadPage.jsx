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
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const dragStart = useRef(null);
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

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
    const handleResetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleZoomChange = (e) => {
        const newScale = parseFloat(e.target.value);
        setScale(newScale);
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    const handleMouseMove = (e) => {
        if (isDragging && scale > 1) {
            setPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleImageClick = (e) => {
        if (tags.length >= 3) {
            setError('All characters have been placed');
            return;
        }

        const rect = imageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - position.x) / scale;
        const y = (e.clientY - rect.top - position.y) / scale;

        const characters = ['waldo', 'wilma', 'wizard'];
        const currentChar = characters[tags.length];

        setTags([...tags, { character: currentChar, x, y }]);
        setCurrentCharacter(characters[tags.length + 1] || null);
    };

    const handleRemoveTag = (indexToRemove) => {
        setTags(prevTags => {
            const newTags = prevTags.filter((_, index) => index !== indexToRemove);
            // Update current character to the next one needed
            const characters = ['waldo', 'wilma', 'wizard'];
            setCurrentCharacter(characters[newTags.length] || null);
            return newTags;
        });
        setError(null);
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
            <div className="upload-layout">
                <div className="upload-section">
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

                        {error && <div className="error-message">{error}</div>}
                        
                        <button type="submit" disabled={loading || tags.length !== 3}>
                            {loading ? 'Uploading...' : 'Upload Image'}
                        </button>
                    </form>
                </div>

                <div className="preview-section">
                    {previewUrl ? (
                        <div className="image-preview">
                            <div className="preview-controls">
                                <h3>Click to mark character positions:</h3>
                                <div className="zoom-controls">
                                    <button type="button" onClick={() => setScale(Math.max(scale - 0.2, 0.5))}>
                                        <span>−</span>
                                    </button>
                                    <div className="zoom-slider-container">
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="3"
                                            step="0.1"
                                            value={scale}
                                            onChange={handleZoomChange}
                                            className="zoom-slider"
                                        />
                                        <span className="zoom-level">{Math.round(scale * 100)}%</span>
                                    </div>
                                    <button type="button" onClick={() => setScale(Math.min(scale + 0.2, 3))}>
                                        <span>+</span>
                                    </button>
                                    <button type="button" onClick={handleResetZoom} className="reset-zoom">
                                        Reset
                                    </button>
                                </div>
                                <p className="character-instruction">
                                    Currently placing: <span className="current-character">{currentCharacter || 'All characters placed'}</span>
                                </p>
                            </div>
                            <div 
                                className="image-container"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                <div 
                                    className="image-wrapper"
                                    style={{
                                        transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                                        cursor: isDragging ? 'grabbing' : 'grab'
                                    }}
                                >
                                    <img
                                        ref={imageRef}
                                        src={previewUrl}
                                        alt="Preview"
                                        onClick={handleImageClick}
                                        className="preview-image"
                                    />
                                    {tags.map((tag, index) => (
                                        <div
                                            key={index}
                                            className="tag-marker"
                                            style={{
                                                left: `${tag.x}px`,
                                                top: `${tag.y}px`,
                                                transform: `scale(${1/scale})`
                                            }}
                                        >
                                            <div className="tag-point" />
                                            <span className="tag-label">{tag.character}</span>
                                            <button 
                                                className="remove-tag"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveTag(index);
                                                }}
                                                title="Remove tag"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-preview">
                            <p>Select an image to preview and start tagging characters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadPage;