import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { cleanImageUrl } from "../../utils";
import "./SearchList.css";
import WishlistButton from "../WishlistButton";
import Footer from "../Footer";
import Fuse from "fuse.js";
import AddToCartButton from "../CartButton";
import Loader from "../Loader";
import useDiscounts from "../../hooks/useDiscounts";
import {
  getDiscountedPrice,
  getFinalPrice,
  getDiscountPercent
} from "../../utils/priceUtils";

export default function SearchList() {
  const [params] = useSearchParams();
  const query = params.get("query");

  const [medicines, setMedicines] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [activeTab, setActiveTab] = useState("medicines");
  const { discountMap, fetchDiscountedItems } = useDiscounts();

  const abortRef = useRef(null);
  const navigate = useNavigate();

  const cardThemes = ["teal", "blue", "green", "yellow", "pink"];

  const fuseOptions = {
    keys: ["name"],
    threshold: 0.6,
    ignoreLocation: true,
    minMatchCharLength: 2,
  };

  useEffect(() => {
    fetchDiscountedItems();
  }, [fetchDiscountedItems]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => setLocation({ latitude: 0, longitude: 0 })
    );
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 2 || !location) return;
    fetchSearchResults(query.trim());
  }, [query, location]);

  const fetchSearchResults = async (searchText) => {
    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      setLoading(true);

      const res = await api.get("/api/v1/items/item-or-store-search", {
        params: { name: searchText.slice(0, 3) },
        headers: {
          zoneId: "[3]",
          moduleId: 2,
          latitude: location.latitude,
          longitude: location.longitude,
        },
        signal: abortRef.current.signal,
      });
      console.log("search api data", res.data);

      const rawItems = res.data?.items || [];
      const rawStores = res.data?.stores || [];

      const fuse = new Fuse(rawItems, fuseOptions);
      const fuzzyItems = fuse.search(searchText).map((r) => r.item);

      setMedicines(fuzzyItems);
      setStores(rawStores);
    } catch (err) {
      if (err.name !== "CanceledError") console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showEmptyState =
    !loading &&
    ((activeTab === "medicines" && medicines.length === 0) ||
      (activeTab === "stores" && stores.length === 0));

  return (
    <>
      <section className="gs-search-container">
        <div className="gs-search-wrapper">
          <div className="gs-search-header">
            <div className="gs-tabs">
              <button
                className={`gs-tab ${activeTab === "medicines" ? "active" : ""}`}
                onClick={() => setActiveTab("medicines")}
              >
                Medicines
              </button>
              <button
                className={`gs-tab ${activeTab === "stores" ? "active" : ""}`}
                onClick={() => setActiveTab("stores")}
              >
                Stores
              </button>
            </div>

            <div className="gs-header-right">
              <h2 className="gs-result-title">
                Results for <span className="gs-highlight">"{query}"</span>
              </h2>
              {!loading && (
                <div className="gs-result-count">
                  {activeTab === "medicines"
                    ? `${medicines.length} items found`
                    : `${stores.length} shops nearby`}
                </div>
              )}
            </div>
          </div>

          {loading && (
            <div className="gs-loader-center">
              <Loader text="Searching..." />
            </div>
          )}

          {showEmptyState && (
            <div className="gs-status-box">
              <p className="gs-no-results">No {activeTab} found here.</p>
            </div>
          )}

          {!loading && activeTab === "medicines" && (
            <div className="gs-medicine-grid">
              {medicines.map((item, index) => {
                const discountedPrice = getDiscountedPrice(item, discountMap);
                const discountPercent = getDiscountPercent(item, discountMap);
                const theme = cardThemes[index % cardThemes.length];

                return (
                  <div
                    className={`gs-medicine-card card-theme-${theme}`}
                    key={item.id}
                    onClick={() => navigate(`/medicine/${item.id}`)}
                  >
                    <div className="gs-wishlist" onClick={(e) => e.stopPropagation()}>
                      <WishlistButton item={item} />
                    </div>

                    {discountPercent && (
                      <div className="discount-badge">{discountPercent}% OFF</div>
                    )}

                    <div className="gs-img-box">
                      <img
                        src={cleanImageUrl(item.image_full_url || item.image) || "/no-image.jpg"}
                        alt={item.name}
                        onError={(e) => (e.currentTarget.src = "/no-image.jpg")}
                      />
                    </div>

                    <h4 className="gs-med-name">{item.name}</h4>

                    <div className="gs-card-info">
                      <div className="price-box">
                        {discountedPrice ? (
                          <>
                            <span className="original-price">₹{item.price || item.unit_price}</span>
                            <span className="discounted-price">₹{discountedPrice}</span>
                          </>
                        ) : (
                          <span className="discounted-price">{item.price || item.unit_price}</span>
                        )}
                      </div>

                      <div className="gs-card-action" onClick={(e) => e.stopPropagation()}>
                        <AddToCartButton
                          item={{
                            ...item,
                            price: getFinalPrice(item, discountMap),
                            original_price: item.price || item.unit_price,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && activeTab === "stores" && (
            <div className="gs-medicine-grid">
              {stores.map((store, index) => {
                const theme = cardThemes[index % cardThemes.length];
                return (
                  <div
                    key={store.id}
                    className={`gs-medicine-card card-theme-${theme}`}
                    onClick={() => navigate(`/view-stores/${store.id}`)}
                  >
                    <div className="gs-img-box">
                      <img
                        src={cleanImageUrl(store.logo_full_url || store.logo)}
                        alt={store.name}
                      />
                    </div>
                    <h4 className="gs-med-name">{store.name}</h4>
                    <p className="gs-med-store">{store.address || "Medical Store"}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}