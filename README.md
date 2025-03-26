# Where's Waldo - Interactive Image Search Game 🎮

## Overview
An interactive web application inspired by the classic "Where's Waldo" game. Players search for hidden characters in complex images while competing for the fastest completion times.

## 🚀 Live Demo
- Frontend: [Play the Game](https://wheres-waldo-cyrm.vercel.app)
- Backend: [API Endpoint](https://wheres-waldo-22nc.onrender.com)

## ✨ Features
- 🔐 User authentication and authorization
- 🖼️ Interactive image zooming and tagging
- ⏱️ Real-time game timer
- 🏆 Global leaderboard system
- 📱 Responsive design for all devices
- 👥 Role-based access (players and authors)

## 🛠️ Technologies Used

### Frontend
- React.js
- Context API for state management
- Axios for API requests
- CSS3 for styling
- JWT for authentication

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Multer for image uploads

## 🏗️ Project Structure
```
wheres-waldo/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── styles/
│   │   └── App.js
└── backend/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── server.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/NikitaGhimire/wheres-waldo.git
cd wheres-waldo
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Configure Environment Variables
Create a `.env` file in the backend directory:
```env
MONGO_URL=your_mongodb_connection_string
PORT=5001
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

4. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

5. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## 🎮 How to Play
1. Create an account or log in
2. Select any available image
3. Find the hidden characters:
   - Waldo
   - Wizard
   - Wilma
4. Click on the image where you think a character is
5. Select the character from the dropdown
6. Complete the game to see your time on the leaderboard

## 🔑 API Endpoints
### Authentication
- POST /register - Register new user
- POST /login - User login
- GET /userDetails - Get authenticated user details

### Images
- GET /images - Get all images
- POST /upload - Upload new image (authors only)
- DELETE /images/:id - Delete image (authors only)

### Game
- GET /tags/:imageId - Get character positions
- POST /scoreboard - Submit game score
- GET /scoreboard/:imageId - Get image leaderboard

## 🚀 Deployment
- Frontend deployed on Vercel
- Backend hosted on Render
- Images stored in server filesystem

## 🔜 Future Improvements
<input disabled="" type="checkbox"> Add more character options
<input disabled="" type="checkbox"> Implement difficulty levels
<input disabled="" type="checkbox"> Add social sharing features
<input disabled="" type="checkbox"> Create mobile app version
<input disabled="" type="checkbox"> Add real-time multiplayer

## 👥 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments
- Original Where's Waldo images and characters
- React.js community
- MongoDB Atlas
- Vercel and Render for hosting