export const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-actual-render-backend-url.onrender.com'
    : 'http://localhost:5001';