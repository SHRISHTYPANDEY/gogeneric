import { useEffect, useState } from "react";

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

  useEffect(() => {

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200); 

    return () => clearTimeout(timer);
  }, []);

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
