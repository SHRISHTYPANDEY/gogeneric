import { Helmet } from "react-helmet-async";

export default function ProductSchema({ medicine, price }) {
  if (!medicine) return null;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${window.location.href}#product`,
    "name": medicine.name,
    "description":
      medicine.description ||
      "Buy genuine medicines online from nearby pharmacies with GoGeneric.",
    "image": [
      medicine.image_full_url || medicine.image || `${window.location.origin}/no-image.jpg`
    ],
    "brand": {
      "@type": "Brand",
      "name": "GoGeneric"
    },
    "offers": price
      ? {
          "@type": "Offer",
          "priceCurrency": "INR",
          "price": price,
          "availability": "https://schema.org/InStock",
          "url": window.location.href
        }
      : {
          "@type": "Offer",
          "availability": "https://schema.org/OutOfStock",
          "url": window.location.href
        }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
    </Helmet>
  );
}
