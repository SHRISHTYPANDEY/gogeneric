import React, { useState, useEffect } from "react";
import "./About.css";
import Footer from "../Footer";

const Counter = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration]);

  return <span>{count}+</span>;
};

const About = () => {
  return (
    <>
      <section className="about-section">
        <h2 className="about-title">ABOUT GOGENERIC</h2>
        <h3 className="subtitle">A Comprehensive Directory For Your Health Care</h3>

        <p class="about-text">
    Go Generic Pharma, an initiative by Singhaniya Med Private Limited,
    is a pioneering digital healthcare platform dedicated to making
    medicines affordable, accessible, and trustworthy for every household
    in India. In a country where millions of people struggle to buy
    expensive branded medicines, we bring a simple yet powerful solution –
    connecting consumers directly with trusted local pharmacies that
    provide quality generic medicines at a fraction of the price.
  </p>

  <p class="about-text">
    Our Promise: Go Generic is not just about delivering medicines; it's
    about delivering trust, care, and relief. Every medicine listed on our
    platform is verified, every partner pharmacy is licensed, and every
    delivery is handled with utmost care.
  </p>

        <div className="stats-container">
          <div className="stat-box">
            <h3><Counter target={100} /></h3>
            <p>Total Cities</p>
          </div>
          <div className="stat-box">
            <h3><Counter target={529} /></h3>
            <p>Total Experts</p>
          </div>
          <div className="stat-box">
            <h3><Counter target={310} /></h3>
            <p>Total Awards</p>
          </div>
        </div>

        <div className="features">
          <div className="feature-item">
            <span>✔</span> Enjoy Many Discounts In Fees
          </div>
          <div className="feature-item">
            <span>✔</span> Growing Listings Of Clinics
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default About;