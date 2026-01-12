import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { toast } from "react-hot-toast";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  let guestId = localStorage.getItem("guest_id");
  if (!token && (!guestId || isNaN(Number(guestId)))) {
    guestId = Date.now();
    localStorage.setItem("guest_id", guestId);
  }

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/api/v1/customer/wish-list", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        params: token ? {} : { guest_id: Number(guestId) },
      });

      setWishlist(res.data?.item || []);
    } catch (err) {
      console.error("Wishlist fetch failed:", err?.response?.data);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  const addToWishlist = async (itemId) => {
    try {
      setLoading(true);

      await api.post(
        "/api/v1/customer/wish-list/add",
        {
          item_id: itemId,
          ...(token ? {} : { guest_id: Number(guestId) }),
        },
        {
          headers: {
            zoneId: JSON.stringify([3]),
            moduleId: 2,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      toast.success("Added to wishlist ❤️");
      fetchWishlist();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.[0]?.message ||
          "Failed to add"
      );
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      setLoading(true);

      await api.delete("/api/v1/customer/wish-list/remove", {
        data: {
          item_id: itemId,
          ...(token ? {} : { guest_id: Number(guestId) }),
        },
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  const isWishlisted = (itemId) =>
    wishlist.some((item) => item.id === itemId);

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
