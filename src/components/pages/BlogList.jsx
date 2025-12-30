import { Link } from "react-router-dom";
import { blogs } from "../../data/blogs.js";
import "./Blog.css";
import Footer from "../../components/Footer.jsx"

export default function BlogList() {
  return (
    <>
    <div className="blog-page">
      <h1 className="blog-title">Our Blogs</h1>

      <div className="blog-list">
        {blogs.map((blog) => (
          <div key={blog.id} className="blog-card">
            
            {/* Image clickable */}
            <Link to={`/blog/${blog.slug}`} className="blog-image">
              <img src={blog.image} alt={blog.title} />
            </Link>

            <div className="blog-content">
              
              {/* Heading clickable */}
              <Link to={`/blog/${blog.slug}`} className="blog-heading-link">
                <h2>{blog.title}</h2>
              </Link>

              <p>{blog.excerpt}</p>

              <Link to={`/blog/${blog.slug}`} className="read-more">
                Read More →
              </Link>
            </div>
          </div>
        ))}
      </div>
      
    </div>
    <Footer />
    </>
  );
}
