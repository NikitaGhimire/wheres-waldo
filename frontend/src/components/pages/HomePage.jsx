import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/HomePage.css';
import Modal from './Modal';

const HomePage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showInstructions, setShowInstructions] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);

        if (token) {
            fetchImages();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchImages = async () => {
        try {
            const response = await axios.get('http://localhost:5001/images', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setImages(response.data.images || []);
        } catch (err) {
            setError('Failed to fetch images');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteImage = async (imageId, e) => {
        e.preventDefault(); // Prevent navigation
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await axios.delete(`http://localhost:5001/images/${imageId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setImages(images.filter(image => image._id !== imageId));
            } catch (err) {
                setError('Failed to delete image');
            }
        }
    };

    const toggleInstructions = () => {
        setShowInstructions(!showInstructions);
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <div className="home-container">
            {!isAuthenticated ? (
                <div className="welcome-section">
                    {/* <h1>Welcome to Where's Waldo</h1> */}
                    <div className="welcome-content">
                        <img src="./walldowalk.svg" alt="Waldo Banner" className="banner-image" />
                        <p className="welcome-text">Join the hunt! Find Waldo and friends in challenging puzzle scenes.</p>
                        <div className="home-buttons">
                            <Link to="/loginPage" className="auth-button login">Login</Link>
                            <Link to="/register" className="auth-button register">Register</Link>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="game-container">
                        <div className="game-layout">
                            <div className="instructions-column">
                                <img src="./wheres-waldo-seeklogo.svg" alt="Waldo Banner" className="waldo-image" />
                                <button 
                                    className="instructions-toggle"
                                    onClick={toggleInstructions}
                                >
                                    {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
                                </button>

                                <section className={`how-to-play ${showInstructions ? 'show' : ''}`}>
                                    <h2>How to Play</h2>
                                    <div className="instructions">
                                        <p>Find these characters in each image:</p>
                                        <div className="characters-guide">
                                            <div className="character">
                                                <img src="./waldo.png" alt="Waldo" />
                                                <p>Waldo</p>
                                            </div>
                                            <div className="character">
                                                <img src="./wizard.png" alt="Wizard" />
                                                <p>Wizard</p>
                                            </div>
                                            <div className="character">
                                                <img src="./wilma.png" alt="Wilma" />
                                                <p>Wilma</p>
                                            </div>
                                        </div>
                                        <ul className="game-rules">
                                            <li>Click on an image to start playing</li>
                                            <li>Click where you think a character is hidden</li>
                                            <li>Find all characters to complete the level</li>
                                            <li>Timer starts when you begin - compete for the fastest time!</li>
                                        </ul>
                                    </div>
                                </section>
                            </div>

                            <section className="available-games">
                                <h2>Available Games</h2>
                                <div className="image-collection">
                                    {images.length > 0 ? (
                                        images.map((image) => (
                                            <div key={image._id} className="image-card">
                                                <div className="image-header">
                                                    <h3>{image.title}</h3>
                                                    {image.authorId._id === userId && (
                                                        <button 
                                                            className="delete-button"
                                                            onClick={(e) => handleDeleteImage(image._id, e)}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="author">By: {image.authorId.username}</p>
                                                <div 
                                                    className="game-link"
                                                    onClick={() => handleImageClick(image)}
                                                >
                                                    <img 
                                                        src={`http://localhost:5001/${image.url}`} 
                                                        alt={image.title} 
                                                    />
                                                    <div className="play-overlay">
                                                        <span>Play Now</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-games">No images available to play</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </>
            )}
            {selectedImage && (
                <Modal 
                    image={selectedImage}
                    onClose={handleCloseModal}
                    username={localStorage.getItem('username')}
                />
            )}
        </div>
    );
};

export default HomePage;
