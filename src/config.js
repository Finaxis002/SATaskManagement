// src/config.js
const config = {
  development: {
    API_URL: "http://localhost:1100",
    SOCKET_URL: "http://localhost:1100",
  },
  production: {
    API_URL: "https://taskbe.sharda.co.in",
    SOCKET_URL: "https://taskbe.sharda.co.in",
  },
};

const environment = import.meta.env.MODE || "development";
export const { API_URL, SOCKET_URL } = config[environment];