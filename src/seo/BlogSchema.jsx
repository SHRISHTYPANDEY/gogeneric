import { Helmet } from "react-helmet-async";

export default function BlogSchema({ blog }) {
  if (!blog) return null;

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt,
    "image": [
      `${window.location.origin}/${blog.image}`
    ],
    "author": {
      "@type": "Organization",
      "name": "GoGeneric"
    },
    "publisher": {
      "@type": "Organization",
      "name": "GoGeneric",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/gogenlogo.png`
      }
    },
    "datePublished": "2025-01-05",
    "dateModified": "2025-01-05",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    }
  };

  const faqSchema = blog.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": blog.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    : null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(blogPostingSchema)}
      </script>

      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
    </Helmet>
  );
}
