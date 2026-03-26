import "./Skeleton.css";

export default function PharmacyCardSkeleton() {
    return (
        <div className="pharmacy-card skeleton-card">

            <div className="skeleton skeleton-img"></div>

            <div className="pharmacy-info">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>

                <div className="skeleton-meta">
                    <div className="skeleton skeleton-chip"></div>
                    <div className="skeleton skeleton-chip"></div>
                    <div className="skeleton skeleton-chip"></div>
                </div>

                <div className="skeleton skeleton-btn"></div>
            </div>

        </div>
    );
}