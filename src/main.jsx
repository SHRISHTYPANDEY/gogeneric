import { StrictMode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import './index.css';
import "react-phone-input-2/lib/style.css";
import App from './App.jsx';
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from './context/WishlistContext.jsx';
import "./i18n";
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
    </HelmetProvider>
    </StrictMode>  
);