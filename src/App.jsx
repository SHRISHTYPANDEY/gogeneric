import TopHeader from "./components/layout/TopHeader.jsx";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Navbar from "./components/layout/Navbar.jsx";
import Home from "./components/pages/Home.jsx";
import { Route, Routes } from "react-router-dom";
import About from "./components/pages/About.jsx";
import Blog from "./components/pages/Blog.jsx";
import Doctors from "./components/pages/Doctors.jsx";
import Profile from "./components/pages/Profile.jsx";
import Searchbar from "./components/layout/Searchbar.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import StoreDetails from "./components/pages/StoreDetails.jsx";
import Cart from "./components/pages/Cart.jsx";
import CategoryItems from "./components/pages/CategoryItems.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import FeaturedStoreDetails from "./components/pages/FeaturedStoreDetails.jsx";
import Wishlist from "./components/pages/Wishlist.jsx";
import ContactUs from "./components/pages/ContactUs.jsx";
import WhatsAppChat from "./components/layout/WhatsAppChat.jsx";
import MedicineDetails from "./components/pages/MedicineDetails.jsx";
import LoginModal from "./components/auth/LoginModal.jsx";
import Notifications from "./components/pages/Notifications.jsx";

function AppLayout() {
  const { showLoginModal, setShowLoginModal } = useAuth();

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { zIndex: 99999 } }} />
      <TopHeader />
      <Navbar />
      <Searchbar />
      <WhatsAppChat />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/view-stores/:id" element={<StoreDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/category/:id" element={<CategoryItems />} />
        <Route path="/store/:id" element={<FeaturedStoreDetails />} />
        <Route path="/medicine/:id" element={<MedicineDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/notifications" element={<Notifications />} />

      </Routes>
      {/* ✅ GLOBAL LOGIN MODAL */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
