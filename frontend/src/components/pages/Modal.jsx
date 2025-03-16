import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/Modal.css';
import axios from 'axios';
import { API_BASE_URL } from '../../context/config';

const Modal = ({ image, onClose, username, onGameFinish }) => {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [dropdownPosition, setDropdownPosition] = useState(null);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [taggedCharacters, setTaggedCharacters] = useState([]);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [scoreboard, setScoreboard] = useState([]);
    const [characterPositions, setCharacterPositions] = useState([]);
    const [lastGame, setLastGame] = useState(null);
    const [playerName, setPlayerName] = useState('Anonymous');
    const timerRef = useRef(null);

    const tolerance = 250;

    // Define fetchScoreboard first
    const fetchScoreboard = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/scoreboard/${image._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            
            const scores = response.data || [];
            setScoreboard(scores);

            const playerScores = scores.filter(score => score.username === playerName);
            if (playerScores.length > 0) {
                const mostRecentScore = playerScores.reduce((latest, current) => {
                    return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
                });
                setLastGame(mostRecentScore);
            }
        } catch (error) {
            console.error('Error fetching scoreboard:', error);
        }
    }, [image._id, playerName]);

    // Define postScore after fetchScoreboard
    const postScore = useCallback(async () => {
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
                username: playerName,
                title: image.title,
                time: timeElapsed,
                imageId: image._id
            };

            const response = await axios.post(
                `${API_BASE_URL}/api/scoreboard`,
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
                await fetchScoreboard();
            }
        } catch (error) {
            console.error('Error saving score:', error.response?.data || error);
        }
    }, [image, playerName, timeElapsed, fetchScoreboard]);

    // Remove unused handleTagSuccess
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        setPlayerName(username || storedUsername || 'Anonymous');
    }, [username]);

    useEffect(() => {
        timerRef.current = setInterval(() => setTimeElapsed((prevTime) => prevTime + 1), 1000);

        const fetchTags = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/tags/${image._id}`, {
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

    useEffect(() => {
        if (taggedCharacters.length === characterPositions.length && characterPositions.length > 0) {
            clearInterval(timerRef.current);
            setGameCompleted(true);
            postScore();
        }
    }, [taggedCharacters, characterPositions, postScore]);

    // Handle image click to initiate tagging
    const handleImageClick = (event) => {
        if (event.target.tagName === 'SELECT') return;

        const imageElement = event.target;
        const rect = imageElement.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        setDropdownPosition({ x, y });
        setIsDropdownVisible(true);
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
        }
    };

    // Handle zoom change
    const handleZoomChange = (event) => setZoomLevel(event.target.value);

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
                        src={`${API_BASE_URL}/${image.url}`}
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
