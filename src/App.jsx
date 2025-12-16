import { useState } from "react";
import TopHeader from "./components/layout/TopHeader.jsx";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Navbar from "./components/layout/Navbar.jsx";
import Home from "./components/pages/Home.jsx";
import { Route, Routes } from "react-router-dom";
import About from "./components/pages/About.jsx";
import Blog from "./components/pages/Blog.jsx";
import Social from "./components/layout/Social.jsx";
import Doctors from "./components/pages/Doctors.jsx";
import Profile from "./components/pages/Profile.jsx";
import Searchbar from "./components/layout/Searchbar.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import StoreDetails from "./components/pages/StoreDetails.jsx";
import Cart from "./components/pages/Cart.jsx";
import CategoryItems from "./components/pages/CategoryItems.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import FeaturedStoreDetails from "./components/pages/FeaturedStoreDetails.jsx";
import Wishlist from "./components/pages/Wishlist.jsx";
import ContactUs from "./components/pages/ContactUs.jsx";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <TopHeader />
      <Navbar />
      <Searchbar />
      <Social />
      <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/profile" element={ <ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/view-stores/:id" element={<StoreDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/category/:id" element={<CategoryItems />} />
        <Route path="/store/:id" element={<FeaturedStoreDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />


      </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
