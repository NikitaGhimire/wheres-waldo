import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/HomePage.css';

const HomePage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) return <div>Loading...</div>;

    return (
        <div className="home-container">
            {!isAuthenticated ? (
                <>
                    <h1>Welcome to the game</h1>
                    <img src="./file.png" alt="" />
                    <p><strong>Please log in or register to find Waldo.</strong></p>
                    <div className="home-buttons">
                        <Link to="/loginPage">
                            <button className="login-button">Login</button>
                        </Link>
                        <Link to="/register">
                            <button className="register-button">Register</button>
                        </Link>
                    </div>
                </>
            ) : (
                <>
                    <h1>Welcome to Where's Waldo</h1>
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
                    <div className="image-collection">
                        {images.length > 0 ? (
                            images.map((image) => (
                                <div key={image._id} className="image-card">
                                    <h3>{image.title}</h3>
                                    <p>By: {image.authorId.username}</p>
                                    <Link to={`/game/${image._id}`}>
                                        <img 
                                            src={`http://localhost:5001/${image.url}`} 
                                            alt={image.title} 
                                        />
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p>No images available to play</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default HomePage;
