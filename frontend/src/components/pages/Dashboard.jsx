import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { API_BASE_URL } from '../../context/config';
import '../styles/Dashboard.css'

const DashboardPage = () => {
    const [images, setImages] = useState([]);
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [scoreboard, setScoreboard] = useState([]);
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [userResponse, imagesResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/userDetails`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }),
                axios.get(`${API_BASE_URL}/images`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                })
            ]);

            setUsername(userResponse.data.username);
            setImages(imagesResponse.data.images || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.response?.data?.error || 'Failed to fetch data');
            if (err.response?.status === 401) {
                navigate('/loginPage');
            }
        }
    }, [navigate]);

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (!role) {
            window.alert('You are not authorised, login or register');
            navigate('/');
            return;
        }

        fetchInitialData();
    }, [navigate, fetchInitialData]);

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setStartTime(Date.now());
        setElapsedTime(0);
        setIsTimerRunning(true);
    };

    const handleDeleteImage = async (imageId, e) => {
        // Stop event from bubbling up to parent
        e.stopPropagation();
        
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await axios.delete(`${API_BASE_URL}/images/${imageId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                // Remove the deleted image from state
                setImages(images.filter(image => image._id !== imageId));
            } catch (err) {
                setError('Failed to delete image');
                console.error(err);
            }
        }
    };

    useEffect(() => {
        let timerInterval;
        if (isTimerRunning) {
            timerInterval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }

        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [isTimerRunning, startTime]);

    const handleFinishGame = () => {
        setIsTimerRunning(false);
        // Update scoreboard for the selected image
        setScoreboard((prevScoreboard) => ({
            ...prevScoreboard,
            [selectedImage._id]: [
                ...(prevScoreboard[selectedImage._id] || []),
                { username, time: elapsedTime }
            ]
        }));
    };

    const handleImageClose = () => {
        setSelectedImage(null);
        setIsTimerRunning(false);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading your game board...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {error && <div className="error-message">{error}</div>}
            <div className="dashboard-header">
                <h1>Hi {username}</h1>
                {role === 'author' ? (
                    <h2 className="image-collection-header">Your Image Collection</h2>
                ) : (
                    <>
                        <div className="characters">
                            <img src="./miss.png" alt="Miss" />
                            <img src="./wizard.png" alt="Wizard" />
                            <img src="./wilma.png" alt="Wilma" />
                        </div>
                        <div className="notice">
                            Waldo, Wizard, and Wilma are in hiding. Find them in your chosen pictures to win this game.
                        </div>
                    </>
                )}
            </div>
            
            <ul className="post-list">
                {images.length > 0 ? (
                    images.map((image) => (
                        <li key={image._id} className="each-post" onClick={() => handleImageClick(image)}>
                            <p><strong>{image.title}, {image.authorId.username}</strong></p>
                            <img 
                                src={`${API_BASE_URL}/${image.url}`} 
                                alt={image.title} 
                                loading="lazy" 
                                width="300" 
                                height="200"
                            />
                            {image.authorId._id === userId && (
                                <button 
                                    className="delete-button"
                                    onClick={(e) => handleDeleteImage(image._id, e)}
                                >
                                    Delete
                                </button>
                            )}
                        </li>
                    ))
                ) : (
                    <p>No images to display. Upload images</p>
                )}
            </ul>

            {selectedImage && (
                <Modal 
                    image={selectedImage} 
                    onClose={handleImageClose} 
                    username={username}
                    scoreboard={scoreboard[selectedImage._id] || []} 
                    onGameFinish={handleFinishGame} 
                />
            )}

            <div className="scoreboard">
                {Object.keys(scoreboard).map((imageId) => {
                    const image = images.find((img) => img._id === imageId);
                    if (!image) return null;
                    return (
                        <div key={imageId}>
                            <h2>{image.title} Scoreboard</h2>
                            <ul>
                                {scoreboard[imageId].map((score, index) => (
                                    <li key={index} className={score.username === username ? 'highlight' : ''}>
                                        {score.username}: {score.time} seconds
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardPage;


