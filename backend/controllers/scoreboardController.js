const Scoreboard = require("../models/Scoreboard");

// Get all scores
const getAllScores = async (req, res) => {
    try {
        const scores = await Scoreboard.find()
            .sort({ time: 1 }) // Sort by fastest time
            .populate('imageId', 'title'); // Get image title
        res.json(scores);
    } catch (err) {
        console.error('Error fetching scores:', err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// Add new score
const addScore = async (req, res) => {
    try {
        const { username, title, time, imageId } = req.body;

        // Debug logging
        console.log('Request body:', req.body);
        console.log('Auth user:', req.user);

        // Validate each field individually for better error messages
        const validationErrors = [];
        
        if (!username && !req.user?.username) {
            validationErrors.push('Username is required');
        }
        if (!title) {
            validationErrors.push('Title is required');
        }
        if (!imageId) {
            validationErrors.push('Image ID is required');
        }
        if (typeof time !== 'number') {
            validationErrors.push('Time must be a number');
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                message: "Invalid input",
                errors: validationErrors,
                received: {
                    username: username || req.user?.username,
                    title,
                    time,
                    imageId
                }
            });
        }

        const newScore = new Scoreboard({
            username: username || req.user.username,
            title,
            time,
            imageId
        });

        const savedScore = await newScore.save();
        res.status(201).json({
            message: "Score saved successfully",
            score: savedScore
        });
    } catch (err) {
        console.error('Score save error:', err);
        res.status(500).json({ 
            message: "Server Error", 
            error: err.message 
        });
    }
};

// Get scores for specific image
const getImageScores = async (req, res) => {
    try {
        const scores = await Scoreboard.find({ imageId: req.params.imageId })
            .sort({ time: 1 })
            .limit(10)
            .populate('imageId', 'title');
        res.json(scores);
    } catch (err) {
        console.error('Error fetching image scores:', err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

module.exports = {
    getAllScores,
    addScore,
    getImageScores
};