import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import "./AutomatedMessage.css"
import Footer from "../Footer";

export default function AutomatedMessage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomatedMessage();
  }, []);

  const fetchAutomatedMessage = async () => {
    try {
      const res = await api.get("/api/v1/customer/automated-message", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });

      // console.log("AUTOMATED MESSAGE 👉", res.data);
      setMessages(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load automated messages");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading..." />;

  return (
    <>
    <div className="policy-page">
      <h1 className="policy-title">Automated Messages</h1>

      {messages.length === 0 ? (
        <p>No messages available</p>
      ) : (
        <ul className="policy-content">
          {messages.map((item) => (
            <li key={item.id} style={{ marginBottom: "12px" }}>
              • {item.message}
            </li>
          ))}
        </ul>
      )}
    </div>
    <Footer />
    </>
  );
}
