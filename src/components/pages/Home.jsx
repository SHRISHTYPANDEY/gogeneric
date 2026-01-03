import { useEffect, useState } from "react";
import { useLocation as useRouterLocation } from "react-router-dom";
import { useLocation } from "../../context/LocationContext";

import CategoriesCard from "../CategoriesCard";
import HomeBanner from "../HomeBanner";
import NearbyStores from "../NearbyStores";
import Highlights from "../Highlights";
import FeaturedStores from "../FeaturedStores";
import Stores from "../Stores";
import Footer from "../Footer";
import CommonConcern from "../CommonConcern";
import Loader from "../Loader";
import SearchBar from "../layout/Searchbar";

export default function Home() {
  const [loading, setLoading] = useState(true);

  const routerLocation = useRouterLocation(); // route change
  const { location } = useLocation(); // 📍 user selected location

  const reloadHome = () => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  };

  /* 🔁 Route change (logo click / navigation) */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    reloadHome();
  }, [routerLocation.key]);

  /* 📍 Location change trigger */
  useEffect(() => {
    if (!location?.lat || !location?.lng) return;

    window.scrollTo({ top: 0, behavior: "smooth" });
    reloadHome();
  }, [location?.lat, location?.lng]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="home">
      <SearchBar />
      <HomeBanner />
      <CategoriesCard />
      <CommonConcern />
      <NearbyStores />
      <Highlights />
      <FeaturedStores />
      <Stores />
      <Footer />
    </div>
  );
}
