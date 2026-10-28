import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // This tells Axios to ALWAYS send secure cookies
});

export default api;