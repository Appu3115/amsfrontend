import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // ✅ add localhost only once
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
