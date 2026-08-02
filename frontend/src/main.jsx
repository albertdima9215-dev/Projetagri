import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import "./index.css"
import "leaflet/dist/leaflet.css";
import { FavoriteProvider } from "./context/FavoriteContext";

createRoot(document.getElementById('root')).render(
  <FavoriteProvider>
    <App />
  </FavoriteProvider>
)
