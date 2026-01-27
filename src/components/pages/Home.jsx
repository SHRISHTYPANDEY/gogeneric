import { useEffect, useState } from "react";
import OrganizationSchema from "../../seo/OrganizationSchema";
import { useLocation as useRouterLocation } from "react-router-dom";
import { useLocation } from "../../context/LocationContext";

import CategoriesCard from "../CategoriesCard";
import HomeBanner from "../HomeBanner";
import NearbyStores from "../NearbyStores";
import Highlights from "../Highlights";
import VisitAgain from "../VisitAgain";
import FeaturedStores from "../FeaturedStores";
import Stores from "../Stores";
import Footer from "../Footer";
import CommonConcern from "../CommonConcern";
import Loader from "../Loader";
import ReviewPopup from "../ReviewPopup";
import RepublicDayPopup from "../RepublicDayPopup";
import api from "../../api/axiosInstance";
import ServiceCard from "../ServiceCard";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [showRepublicPopup, setShowRepublicPopup] = useState(false);


  const routerLocation = useRouterLocation();
  const { location } = useLocation();

  const reloadHome = () => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    reloadHome();
  }, [routerLocation.key]);

  useEffect(() => {
    if (!location?.lat || !location?.lng) return;

    window.scrollTo({ top: 0, behavior: "smooth" });
    reloadHome();
  }, [location?.lat, location?.lng]);

  /* ---------------- REVIEW POPUP LOGIC (NEW & SAFE) ---------------- */

  useEffect(() => {
  if (loading) return;

  const checkPendingReview = async () => {
    try {
      const res = await api.get(
        "/api/v1/customer/order/list?limit=20&offset=0"
      );

      const orders = res.data?.data || [];

      const pendingOrder = orders.find(
        (o) => o.order_status === "delivered" && o.is_reviewed === 0
      );

      if (!pendingOrder) return;

      const orderId = pendingOrder.id;

      if (localStorage.getItem(`review_done_${orderId}`)) return;

      const laterTime = localStorage.getItem(`review_later_${orderId}`);
      if (laterTime && Date.now() < Number(laterTime)) return;

      setReviewOrder(pendingOrder);
    } catch (e) {
      console.error("Review check failed", e);
    }
  };

  checkPendingReview();
}, [loading]);
useEffect(() => {
  const today = new Date();

  const year = today.getFullYear();

  const start = new Date(year, 0, 22); 
  const end = new Date(year, 0, 26, 23, 59, 59); 

  if (today < start || today > end) return;

  const laterUntil = localStorage.getItem("republic_day_later");

  if (laterUntil && new Date(laterUntil) > new Date()) return;

  setShowRepublicPopup(true);
}, []);

const handleLater = () => {
  const nextTime = new Date();
  nextTime.setHours(nextTime.getHours() + 24);

  localStorage.setItem(
    "republic_day_later",
    nextTime.toISOString()
  );

  setShowRepublicPopup(false);
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  /* ---------------- UI (UNCHANGED) ---------------- */

  return (
    <>
      <OrganizationSchema />

      <div className="home">
        <HomeBanner />
        <ServiceCard />
        <CategoriesCard />
        <CommonConcern />
        <NearbyStores />
        <Highlights />
        <VisitAgain />
        <FeaturedStores />
        <Stores />
        <Footer />
      </div>

 {reviewOrder && (
  <ReviewPopup
    order={reviewOrder}
    onClose={() => {
      const nextTime = Date.now() + 6 * 60 * 60 * 1000;
      localStorage.setItem(
        `review_later_${reviewOrder.id}`,
        nextTime
      );
      setReviewOrder(null);
    }}
    onSuccess={() => {
      localStorage.setItem(
        `review_done_${reviewOrder.id}`,
        "1"
      );
      setReviewOrder(null);
    }}
  />
)}

{showRepublicPopup && (
  <RepublicDayPopup onLater={handleLater} />
)}

  
    </>
  );
}
