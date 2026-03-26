export default function SearchSkeleton({ count = 4 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div className="search-item skeleton-item" key={i}>
                    <div className="skeleton skeleton-img"></div>

                    <div className="search-info">
                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-tag"></div>
                    </div>
                </div>
            ))}
        </>
    );
}