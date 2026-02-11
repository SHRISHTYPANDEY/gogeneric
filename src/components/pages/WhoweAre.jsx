import "./WhoweAre.css";
import Footer from "../Footer";
import WhoWeAreSchema from "../../seo/WhoWeAreSchema";
export default function WhoWeAre() {
  return (
    <>
    <WhoWeAreSchema />
      <div className="who-we-are">
        {/* Hero */}
        <section className="who-hero">
          <h1>Who We Are</h1>
          <p>Building India’s Local Digital Healthcare Ecosystem</p>
        </section>

        {/* About */}
        <section className="who-section">
          <h2>About Go Generic</h2>
          <p>
            Go Generic is a digital healthcare platform built on trust,
            transparency, and technology. We empower local pharmacies while
            enabling customers to access quality healthcare locally and
            affordably.
          </p>
        </section>

        {/* Vision & Mission */}
        <section className="who-grid">
          <div className="who-card">
            <h3>Our Vision</h3>
            <p>
              To create a digitally connected healthcare ecosystem where every
              Indian can access quality medicines locally, affordably, and
              reliably.
            </p>
          </div>

          <div className="who-card">
            <h3>Our Mission</h3>
            <p>
              To digitally enable local pharmacies, ensure transparency in
              pricing and availability, and expand access to healthcare services
              across India.
            </p>
          </div>
        </section>

        {/* Leadership */}
        <section className="who-section">
  <h2>Leadership</h2>

  {/* Leader 1: Image Left */}
  <div className="leader-card">
    <div className="leader-image-container">
      <img src="/who-we-are/image-1.png" alt="Mr. Kailash Singhania" className="leader-img-large" />
    </div>
    <div className="leader-content">
      <span>Director</span>
      <h4>Mr. Kailash Singhania</h4>
      <p>
       Go Generic stands for trust, transparency, and transformation. We
              are proud to offer a platform where retailers retain control,
              customers receive value, and technology drives progress. As we
              expand into new health-related services, our focus remains clear:
              to create an ecosystem where every Indian can access quality
              healthcare — locally, affordably, and digitallyWe are constantly
              evolving — adding new features, expanding health services, and
              most importantly, listening to the people we serve. Together,
              let’s build a healthier, stronger, and more connected India.
			  
      </p>
    </div>
  </div>

  {/* Leader 2: Image Right */}
  <div className="leader-card leader-reverse">
    <div className="leader-image-container">
      <img src="/who-we-are/image-2.png" alt="Mr. Vibhor Singhania" className="leader-img-large" />
    </div>
    <div className="leader-content">
      <span>Director</span>
      <h4>Mr. Vibhor Singhania</h4>
      <p>
         At Go Generic, our journey began with powerful vision — to make
              healthcare more accessible, affordable, and local. In a country as
              vast and diverse as India, millions still struggle to access
              quality medicines at fair prices. At the same time, thousands of
              local pharmacies face challenges in keeping up with the digital
              transformation. Go Generic bridges this gap. Our model is built on
              transparency, trust, and community. We do not act as a seller, but
              as a digital enabler — connecting consumers with nearby trusted
              pharmacies and ensuring real-time medicine availability, fair
              pricing, and doorstep delivery. Together, let’s make healthcare
              truly local, inclusive, and affordable for all.
      </p>
    </div>
  </div>

  {/* Leader 3: Image Left */}
  <div className="leader-card">
    <div className="leader-image-container">
      <img src="/who-we-are/image-3.jpeg" alt="Mr. Rahul Kumar Singh" className="leader-img-large" />
    </div>
    <div className="leader-content">
      <span>Chief Operating Officer</span>
      <h4>Mr. Rahul Kumar Singh</h4>
      <p>
       	   At Go Generic, we believe that true innovation lies in simplicity,
              inclusivity, and impact. As we work towards transforming India’s
              healthcare landscape, our focus remains crystal clear — to ensure
              that every individual, regardless of their location or income, has
              access to affordable, quality healthcare. As the Chief Operating
              Officer, I take pride in building operational systems that are
              efficient, scalable, and retailer-friendly. From streamlining
              real-time medicine availability to ensuring smooth order
              processing and prompt deliveries, our goal is to offer a seamless
              experience to both consumers and pharmacy partners.
      </p>
    </div>
  </div>
</section>
      </div>
      {/* Download Our Apps */}
      <section className="apps-section">
        <h2>Download Our Apps</h2>
        <p className="apps-subtitle">
          Whether you are a customer, pharmacy retailer, or delivery partner —
          Go Generic has an app for you.
        </p>

        <div className="apps-grid">
          {/* Customer App */}
          <div className="app-card">
            <h3>Customer App</h3>
            <p>
              Order medicines, upload prescriptions, track delivery & save more.
            </p>

            <div className="app-actions">
              <a
                href="https://play.google.com/store/apps/details?id=com.gogeneric.user"
                target="_blank"
                rel="noopener noreferrer"
                className="store-link"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                />
              </a>
            </div>
          </div>

          {/* Vendor App */}
          <div className="app-card">
            <h3>Vendor / Retailer App</h3>
            <p>
              Manage orders, set pricing, track payouts and grow your pharmacy
              online.
            </p>

            <div className="app-actions">
              <a
                href="https://play.google.com/store/apps/details?id=com.gogeneric.vendor"
                target="_blank"
                rel="noopener noreferrer"
                className="store-link"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                />
              </a>
            </div>
          </div>

          {/* Delivery Partner App */}
          <div className="app-card">
            <h3>Delivery Partner App</h3>
            <p>
              Accept orders, navigate easily, earn daily payouts with full
              support.
            </p>

            <div className="app-actions">
              <a
                href="https://play.google.com/store/apps/details?id=com.gogeneric.delivery"
                target="_blank"
                rel="noopener noreferrer"
                className="store-link"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                />
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
