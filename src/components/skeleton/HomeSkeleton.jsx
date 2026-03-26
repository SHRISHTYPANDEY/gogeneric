import "./skeleton.css";

export default function HomeSkeleton() {
    return (
        <div className="home">

            {/* Banner */}
            <div className="skeleton banner-skeleton"></div>

            {/* Services */}
            <div className="skeleton-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton service-skeleton"></div>
                ))}
            </div>

            {/* Categories */}
            <div className="skeleton-title"></div>

            <div className="skeleton-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton category-skeleton"></div>
                ))}
            </div>

            {/* Stores */}
            <div className="skeleton-title"></div>

            <div className="skeleton-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton store-skeleton"></div>
                ))}
            </div>

        </div>
    );
}