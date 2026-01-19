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

export default function Home() {
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  return (
    <>
    <OrganizationSchema />
    <div className="home">
      <HomeBanner />
      <CategoriesCard />
      <CommonConcern />
      <NearbyStores />
      <Highlights />
      <VisitAgain />
      <FeaturedStores />
      <Stores />
      <Footer />
    </div>
    </>
  );
}
