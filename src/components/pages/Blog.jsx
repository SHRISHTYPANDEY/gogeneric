import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import "./Blog.css";
import Footer from "../Footer";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../layout/Navbar";

export default function Blog(){
      const navigate = useNavigate();

  const blogData = [
    {
      title: "What are Generic Medicines?",
      content:
        "Generic medicines are bioequivalent to branded drugs, meaning they have the same active ingredients, strength, dosage form, and route of administration. They are usually more affordable without compromising quality. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vel sapien elit. In malesuada semper mi, nec egestas leo facilisis id. Sed vulputate justo vel turpis volutpat, a sagittis purus tincidunt.",
      img: "/insight1.png",
    },
    {
      title: "Benefits of Using Generic Medicines",
      content:
        "Generic medicines are cost-effective, equally effective as branded ones, widely available, and strictly regulated for safety and quality. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ac diam sit amet quam vehicula elementum sed sit amet dui. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus.",
       img: "/insight2.png",
    },
    {
      title: "GoGeneric's Mission",
      content:
        "Our mission is to spread awareness about generic medicines and healthcare solutions. We empower people to make affordable and safe health choices. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Etiam porta sem malesuada magna mollis euismod.",
      img: "/insight1.png",
    },
    {
      title: "Health Tips for Everyday Life",
      content:
        "Stay healthy with a balanced diet, regular exercise, hydration, mental care, and preventive check-ups. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Maecenas faucibus mollis interdum. Nulla vitae elit libero, a pharetra augue.",
      img: "/insight2.png",
    },
  ];
       
  return (
    <>
      <div className="visi">
      </div>

      <div className="blog-page">
        <header className="blog-header">
          <h1 style={{ fontWeight: "100" }}>
            GoGeneric - Affordable Healthcare for Everyone
          </h1>
          <p>
            Explore articles, tips, and guides about generic medicines and
            living a healthier life. Learn how to make informed choices and
            improve your well-being with practical health advice.
          </p>
        </header>

        <main className="blog-content">
          {blogData.map((item, index) => (
            <section
              className={`blog-section ${
                index % 2 === 0 ? "normal" : "reverse"
              }`}
              key={index}
            >
              <div className="blog-img">
                <img src={item.img} alt={item.title} />
              </div>
              <div className="blog-text">
                <h2>{item.title}</h2>
                <p>{item.content}</p>
              </div>
            </section>
          ))}
        </main>
      </div>
      <Footer />
        
        </>
    )
}