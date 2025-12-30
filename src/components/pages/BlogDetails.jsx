import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { blogs } from "../../data/blogs.js";
import "./BlogDetails.css";
import FAQ from "./Faq.jsx";
import BlogCTA from "./BlogCTA.jsx";
import Footer from "../../components/Footer.jsx";
export default function BlogDetails() {
  const { slug } = useParams();
  const blog = blogs.find((b) => b.slug === slug);

  useEffect(() => {
    if (!blog?.faqSchema) return;

    const oldScript = document.getElementById("faq-schema");
    if (oldScript) {
      oldScript.remove();
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-schema";
    script.text = JSON.stringify(blog.faqSchema);

    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById("faq-schema");
      if (existing) existing.remove();
    };
  }, [blog]);

  if (!blog) {
    return <p className="blog-not-found">Blog not found</p>;
  }

  return (
    <>
    <div className="blog-details">
      <h1 className="blog-title">{blog.title}</h1>

      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
      {blog?.faqs && (
  <FAQ faqs={blog.faqs} />
)}
<BlogCTA />
    </div>
    <Footer />
    </>
  );
}
