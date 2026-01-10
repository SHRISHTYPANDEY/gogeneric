import { Helmet } from "react-helmet-async";

export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GoGeneric",
    url: "https://gogeneric.co.in",
    logo: "https://gogeneric.co.in/assets/gogenlogo.png",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "info@gogenericpharma.com",
      phoneNumber: "+91-9211510600",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [
      "https://www.facebook.com/profile.php?id=61575015842306&mibextid=ZbWKwL",
      "https://x.com/GoGenericPharma",
      "https://www.instagram.com/gogenericpharma/?igsh=Z3RmbmVjaHlubHg2#",
      "https://www.youtube.com/@go_generic",
       "https://www.linkedin.com/company/singhania-med-private-limited/",
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
