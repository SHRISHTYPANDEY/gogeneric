import { Helmet } from "react-helmet-async";

export default function CategorySchema({ categories = [] }) {
  if (!categories.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Top Product Categories",
    "description": "Browse medicines and healthcare products by category",
    "url": "https://gogeneric.co.in",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": categories.map((cat, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": cat.name,
        "url": `https://gogeneric.co.in/category/${cat.id}`,
        "image": cat.image_full_url || ""
      }))
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
