import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import './index.css';
import App from './App.jsx';
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from './context/WishlistContext.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <WishlistProvider>
      <App />
      </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
