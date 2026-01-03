import TopHeader from "./components/layout/TopHeader.jsx";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Navbar from "./components/layout/Navbar.jsx";
import Home from "./components/pages/Home.jsx";
import { Route, Routes } from "react-router-dom";
import About from "./components/pages/About.jsx";
import Doctors from "./components/pages/Doctors.jsx";
import Profile from "./components/pages/Profile.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { WalletProvider } from "./context/WalletContext.jsx";
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
import DoctorDetails from "./components/pages/DoctorDetails.jsx";
import DoctorPlans from "./components/pages/PlansPage.jsx";
import RefundPolicy from "./components/pages/RefundPolicy.jsx";
import PrivacyPolicy from "./components/pages/PrivacyPolicy.jsx";
import Orders from "./components/pages/Orders.jsx";
import TrackOrder from "./components/orders/TrackOrder.jsx";
import Wallet from "./components/pages/Wallet.jsx";
import OrderDetails from "./components/orders/OrderDetails.jsx";
import Terms from "./components/pages/Terms.jsx";
import Cancellation from "./components/pages/Cancellation.jsx";
import Coupon from "./components/pages/Coupon.jsx";
import AutomatedMessage from "./components/pages/AutomatedMessage.jsx";
import Shipping from "./components/pages/Shipping.jsx";
import BlogDetails from "./components/pages/BlogDetails.jsx";
import BlogList from "./components/pages/BlogList.jsx";
import Checkout from "./components/pages/checkout/Checkout.jsx";
import { LocationProvider } from "./context/LocationContext.jsx";
import { useEffect } from "react";
import { useLocation } from "./context/LocationContext";
import SearchList from "./components/pages/SearchList.jsx";

const fetchAddress = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`
    );
    const data = await res.json();
    return data.results?.[0]?.formatted_address || "";
  } catch {
    return "";
  }
};

function AppLayout() {
  const { showLoginModal, setShowLoginModal } = useAuth();
  const { location, setLocation } = useLocation();
  useEffect(() => {
    if (location) return; // already set

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const address = await fetchAddress(lat, lng);

        setLocation({ lat, lng, address });
      },
      () => {
        setLocation({
          lat: 28.6139,
          lng: 77.209,
          address: "New Delhi, India",
        });
      }
    );
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{ style: { zIndex: 9999999 } }}
      />
      <TopHeader />
      <Navbar />
      <WhatsAppChat />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorDetails />} />
        <Route path="/doctors/:id/plans" element={<DoctorPlans />} />

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
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/orders/:id/track" element={<TrackOrder />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cancel" element={<Cancellation />} />
        <Route path="/coupon" element={<Coupon />} />
        <Route path="/help" element={<AutomatedMessage />} />
        <Route path="/shipping" element={<Shipping />} />
         <Route path="/blog" element={<BlogList />} />
  <Route path="/blog/:slug" element={<BlogDetails />} />
  <Route path="/checkout" element={<Checkout />} />
  <Route path="/searchlist" element={<SearchList />} />



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
      <WalletProvider>
        <LocationProvider>
        <AppLayout />
        </LocationProvider>
      </WalletProvider>
    </AuthProvider>
  );
}
