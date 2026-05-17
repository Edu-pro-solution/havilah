import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import axios from "axios";
import App from "./App.tsx";
import "./index.css";
import store from "./store.js";

const apiOrigin = import.meta.env.VITE_API_URL || "http://localhost:5000";
axios.defaults.baseURL = apiOrigin;

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
