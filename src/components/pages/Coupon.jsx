import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import "./Coupon.css";

export default function Coupon() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get("/api/v1/coupon/list", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });

      console.log("COUPONS ", res.data);
      setCoupons(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading offers..." />;

  return (
    <div className="coupon-page">
      <h1 className="coupon-title">Available Offers</h1>

      {coupons.length === 0 ? (
        <p className="no-coupon">No coupons available</p>
      ) : (
        <div className="coupon-grid">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="coupon-card">
              <div className="coupon-top">
                <h3>{coupon.title || coupon.code}</h3>
                <span className="coupon-code">{coupon.code}</span>
              </div>

              <p className="coupon-desc">
                {coupon.description || "Special discount available"}
              </p>

              <div className="coupon-footer">
                <span>
                  Discount:{" "}
                  <strong>
                    {coupon.discount_type === "percent"
                      ? `${coupon.discount}%`
                      : `₹${coupon.discount}`}
                  </strong>
                </span>

                {coupon.expire_date && (
                  <span className="coupon-expiry">
                    Valid till {coupon.expire_date}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
