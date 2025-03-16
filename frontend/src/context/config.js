export 

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-render-app-name.onrender.com'
    : 'http://localhost:5001';