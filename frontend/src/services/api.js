import axios from "axios";

const api = axios.create({
  baseURL: "https://projetagri.onrender.com/api",
});

export default api;

/*import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default api;*/