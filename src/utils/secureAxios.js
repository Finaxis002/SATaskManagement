import axios from "axios";

const secureAxios = axios.create({
  baseURL: "https://taskbe.sharda.co.in/api",
});

secureAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
   console.log("Auth Token:", token); // check token in console
  config.headers.Authorization = `Bearer ${token}`;
  config.headers["x-app-client"] = "frontend-authenticated";
  return config;
});

export default secureAxios;
