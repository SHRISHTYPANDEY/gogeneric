import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { toast } from "react-hot-toast";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist
  const fetchWishlist = async () => {
    try {
      const res = await api.get("/api/v1/customer/wish-list", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });

      setWishlist(res.data?.item || []);
    } catch (err) {
      console.error("Wishlist fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Add
  const addToWishlist = async (itemId) => {
    try {
      setLoading(true);
      await api.post(
        "/api/v1/customer/wish-list/add",
        { item_id: itemId },
        {
          headers: {
            zoneId: JSON.stringify([3]),
            moduleId: 2,
          },
        }
      );
      toast.success("Added to wishlist ❤️");
      fetchWishlist();
    } catch (err) {
      toast.error("Failed to add");
    } finally {
      setLoading(false);
    }
  };

  // Remove
  const removeFromWishlist = async (itemId) => {
    try {
      setLoading(true);
      await api.delete("/api/v1/customer/wish-list/remove", {
        data: { item_id: itemId },
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });
      toast.success("Removed from wishlist 💔");
      fetchWishlist();
    } catch (err) {
      toast.error("Failed to remove");
    } finally {
      setLoading(false);
    }
  };

  // Check
  const isWishlisted = (itemId) =>
    wishlist.some((item) => item.id === itemId);

  // ✅ TOGGLE (INSIDE PROVIDER)
  const toggleWishlist = async (item) => {
    if (isWishlisted(item.id)) {
      await removeFromWishlist(item.id);
    } else {
      await addToWishlist(item.id);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
