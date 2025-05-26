import axios, { AxiosInstance } from "axios";

const API_URL = "http://localhost:8082";
// const API_URL = "http://ec2-3-219-44-29.compute-1.amazonaws.com";

// Create axios instance with proper typing
const paymentApiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

paymentApiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        // LOG! Cek token sebelum dikirim
        console.log("Sending JWT token: ", token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


paymentApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized access. Redirecting to login.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default paymentApiClient;