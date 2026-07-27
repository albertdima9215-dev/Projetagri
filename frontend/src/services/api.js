import axios from "axios";

const api = axios.create({
  baseURL: "https://projetagri.onrender.com/api/...",
});

export default api;