import axios from "axios";

/** Matches legacy `src/axios.js` — unwraps API errors for consistent `.catch` handling. */
const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || "Something went wrong!")
);

export default axiosInstance;
