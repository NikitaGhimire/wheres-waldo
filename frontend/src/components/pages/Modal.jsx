import React, { useState, useEffect, useRef } from 'react';
import '../styles/Modal.css';
import axios from 'axios';

const Modal = ({ image, onClose, username }) => {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [dropdownPosition, setDropdownPosition] = useState(null);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isTagging, setIsTagging] = useState(false);
    const [taggedCharacters, setTaggedCharacters] = useState([]);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [scoreboard, setScoreboard] = useState([]);
    const [characterPositions, setCharacterPositions] = useState([]);
    const [lastGame, setLastGame] = useState(null); // Track the last game played by the user
    const [playerName, setPlayerName] = useState('Anonymous');
    const timerRef = useRef(null);

    const tolerance = 250;

    // Add useEffect to handle username changes
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        setPlayerName(username || storedUsername || 'Anonymous');
    }, [username]);

    // Start the timer for the game
    useEffect(() => {
        timerRef.current = setInterval(() => setTimeElapsed((prevTime) => prevTime + 1), 1000);

        const fetchTags = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/tags/${image._id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setCharacterPositions(response.data.tags);
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };

        fetchTags();

        return () => clearInterval(timerRef.current);
    }, [image]);

    // Check if the game is completed and handle the score submission
    useEffect(() => {
        if (taggedCharacters.length === characterPositions.length && characterPositions.length > 0) {
            clearInterval(timerRef.current);
            setGameCompleted(true);
            postScore();
        }
    }, [taggedCharacters, characterPositions, playerName]); // Add playerName to dependencies

    // Handle image click to initiate tagging
    const handleImageClick = (event) => {
        if (event.target.tagName === 'SELECT') return;

        const imageElement = event.target;
        const rect = imageElement.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        setDropdownPosition({ x, y });
        setIsDropdownVisible(true);
        setIsTagging(true);
    };

    // Handle character selection for tagging
    const handleCharacterSelect = (character) => {
        if (character) {
            const clickedPosition = dropdownPosition;
            const correctTag = characterPositions.find((tag) => tag.character === character);

            if (correctTag) {
                const distance = Math.sqrt(
                    Math.pow(clickedPosition.x - correctTag.x, 2) +
                    Math.pow(clickedPosition.y - correctTag.y, 2)
                );

                if (distance <= tolerance) {
                    setTaggedCharacters((prev) => [...prev, character]);
                    alert(`${character} tagged correctly!`);
                } else {
                    alert(`${character} tagged incorrectly!`);
                }
            }

            setIsDropdownVisible(false);
            setIsTagging(false);
        }
    };

    // Handle zoom change
    const handleZoomChange = (event) => setZoomLevel(event.target.value);

    // Post the score to the backend
    const postScore = async () => {
        try {
            if (!image?.title || !image?._id || typeof timeElapsed !== 'number') {
                console.log('Missing required score data:', {
                    username: playerName,
                    title: image?.title,
                    imageId: image?._id,
                    time: timeElapsed
                });
                return;
            }

            const scoreData = {
                username: playerName, // Use playerName directly
                title: image.title,
                time: timeElapsed,
                imageId: image._id
            };

            console.log('Sending score data:', scoreData);

            const response = await axios.post(
                'http://localhost:5001/api/scoreboard',
                scoreData,
                {
                    headers: { 
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                const savedScore = response.data.score;
                setLastGame(savedScore);
                await fetchScoreboard(); // Refresh scoreboard after posting
            }
        } catch (error) {
            console.error('Error saving score:', error.response?.data || error);
        }
    };

    // Fetch the scoreboard for the specific image
    const fetchScoreboard = async () => {
        try {
            const response = await axios.get(`http://localhost:5001/api/scoreboard/${image._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            
            const scores = response.data || [];
            setScoreboard(scores);

            // Find the last game played by current player (most recent)
            const playerScores = scores.filter(score => score.username === playerName);
            if (playerScores.length > 0) {
                // Get the most recent score
                const mostRecentScore = playerScores.reduce((latest, current) => {
                    return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
                });
                setLastGame(mostRecentScore);
            }
        } catch (error) {
            console.error('Error fetching scoreboard:', error);
        }
    };

    // Highlight the last completed game for the player
    const highlightLastGame = (score) => {
        if (!lastGame) return '';
        return score._id === lastGame._id ? 'highlight' : '';
    };

    // Modal for the completed game
    if (gameCompleted) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h3>Game Completed!</h3> {/* This is now inside the scoreboard section */}
                    <h3>Scoreboard</h3>
                    <table className="scoreboard">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Player</th>
                                <th>Time (s)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scoreboard.length > 0 ? (
                                scoreboard.map((score, index) => (
                                    <tr key={score._id} className={highlightLastGame(score)}>
                                        <td>{index + 1}{index === 0 && '⭐'}</td>
                                        <td>{score.username}</td>
                                        <td>{score.time}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">No scores available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <button className="close-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    // Game in progress modal
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>X</button>
                <div className="zoom-bar-container">
                    <div className="timer-display">Time Elapsed: {timeElapsed}s</div>
                    <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={zoomLevel}
                        onChange={handleZoomChange}
                        className="zoom-slider"
                    />
                </div>
                <div className="image-container" onClick={handleImageClick}>
                    <img
                        src={`http://localhost:5001/${image.url}`}
                        alt={image.title}
                        className="zoomable-image"
                        style={{ transform: `scale(${zoomLevel})` }}
                    />
                </div>
                {isDropdownVisible && dropdownPosition && (
                    <div
                        className="dropdown"
                        style={{
                            left: `${dropdownPosition.x}px`,
                            top: `${dropdownPosition.y}px`,
                            position: 'absolute',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10,
                        }}
                    >
                        <select onChange={(e) => handleCharacterSelect(e.target.value)}>
                            <option value="">Select Character</option>
                            {characterPositions.map((tag) => (
                                <option key={tag.character} value={tag.character}>
                                    {tag.character}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
