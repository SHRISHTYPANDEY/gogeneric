import { Helmet } from "react-helmet-async";

export default function WhoWeAreSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${window.location.href}#about`,
        "url": window.location.href,
        "name": "Who We Are | Go Generic",
        "description":
          "Learn about Go Generic, our vision, mission, and leadership team building India’s local digital healthcare ecosystem.",
        "publisher": {
          "@type": "Organization",
          "name": "GoGeneric",
          "url": "https://gogeneric.co.in"
        }
      },

      {
        "@type": "Organization",
        "@id": "https://gogeneric.co.in/#organization",
        "name": "GoGeneric",
        "url": "https://gogeneric.co.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://gogeneric.co.in/gogenlogo.png"
        }
      },

      {
        "@type": "Person",
        "@id": "https://gogeneric.co.in/#kailash-singhania",
        "name": "Mr. Kailash Singhania",
        "jobTitle": "Director",
        "worksFor": {
          "@id": "https://gogeneric.co.in/#organization"
        }
      },

      {
        "@type": "Person",
        "@id": "https://gogeneric.co.in/#vibhor-singhania",
        "name": "Mr. Vibhor Singhania",
        "jobTitle": "Director",
        "worksFor": {
          "@id": "https://gogeneric.co.in/#organization"
        }
      },

      {
        "@type": "Person",
        "@id": "https://gogeneric.co.in/#rahul-kumar-singh",
        "name": "Mr. Rahul Kumar Singh",
        "jobTitle": "Chief Operating Officer",
        "worksFor": {
          "@id": "https://gogeneric.co.in/#organization"
        }
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
