import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import './Dashboard.css';

const DashboardPage = () => {
    const [images, setImages] = useState([]);
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [title, setTitle] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [scoreboard, setScoreboard] = useState([]);
    const [tags, setTags] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showForm, setShowForm] = useState(false);  // Track form visibility
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (!role) {
            window.alert('You are not authorised, login or register');
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                await fetchUserDetails();
                await fetchImages();
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, [navigate]);

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:5001/userDetails`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setUsername(response.data.username);
        } catch (err) {
            console.error("Error fetching user details:", err);
            setError(err.response?.data?.error || 'Failed to fetch user details');
            if (err.response?.status === 401) {
                navigate('/loginPage');
            }
        }
    };

    const fetchImages = async () => {
        try {
            const response = await axios.get(`http://localhost:5001/images`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setImages(response.data.images || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching images:", err);
            setError(err.response?.data?.error || 'Failed to fetch images');
            if (err.response?.status === 401) {
                navigate('/loginPage');
            }
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleCanvasClick = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const character = prompt("Enter character name (e.g., Waldo):");
        if (character) {
            setTags([...tags, { character, x, y }]);
        }
    };

    const handleUpload = async () => {
        const authorId = localStorage.getItem('userId');
        if (!selectedFile || !title || !authorId || !tags.length) {
            alert('Please provide all required information and mark character positions');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('title', title);
        formData.append('authorId', authorId);
        formData.append("tags", JSON.stringify(tags));

        try {
            const response = await axios.post(`http://localhost:5001/upload`, formData, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setImages(prevImages => [...prevImages, response.data.image]);
            setTitle('');
            setTags([]);
            setPreviewUrl(null);
            setSelectedFile(null);
            alert('Image uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            alert(`Failed to upload image. ${error.response?.data?.message || 'Server error'}`);
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setStartTime(Date.now());
        setElapsedTime(0);
        setIsTimerRunning(true);
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

    const handleUploadButtonClick = () => {
        setShowForm(!showForm);  // Toggle form visibility
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Hi {username}</h1>

                {role === 'author' && (
                    <>
                        <button className="upload-toggle-btn" onClick={handleUploadButtonClick}>
                            {showForm ? 'Cancel Upload' : 'Upload Image'}
                        </button>

                        {showForm && (
                            <div className={`upload-form-container ${showForm ? 'show' : ''}`}>
                                <input
                                    type="text"
                                    placeholder="Enter image title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="upload-input"
                                />
                                <input 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    className="upload-input" 
                                />
                                <button className="post-image-btn" onClick={handleUpload}>
                                    Upload Image
                                </button>

                                {previewUrl && (
                                    <div>
                                        <h3>Click on the image to mark character positions</h3>
                                        <div style={{ position: "relative", display: "inline-block" }}>
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                style={{ width: "500px", height: "auto", cursor: "crosshair" }}
                                                onClick={handleCanvasClick}
                                            />
                                            {tags.map((tag, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        position: "absolute",
                                                        left: `${tag.x}px`,
                                                        top: `${tag.y}px`,
                                                        transform: "translate(-50%, -50%)",
                                                        background: "red",
                                                        width: "10px",
                                                        height: "10px",
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <ul>
                                            {tags.map((tag, index) => (
                                                <li key={index}>
                                                    {tag.character}: ({tag.x}, {tag.y})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                
                            </div>
                        )}
                        {role === 'author' ? (
                                                    <h2 className="image-collection-header">Image Collection</h2> // **Change: centered header for authors**
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
                    </>
                )}
            </div>

            <ul className="post-list">
                {images.length > 0 ? (
                    images.map((image) => (
                        <li key={image._id} className="each-post" onClick={() => handleImageClick(image)}>
                            <p><strong>{image.title}, {image.authorId.username}</strong></p>
                            <img src={`http://localhost:5001/${image.url}`} alt={image.title} />
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


