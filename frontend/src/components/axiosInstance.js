// src/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:6000", // Your backend URL
});

export default axiosInstance;
