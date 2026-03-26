import SkeletonCard from "./SkeletonCard";

function SkeletonGrid({ count = 8 }) {
    return (
        <div className="doctors-grid">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
function CategorySkeleton() {
    return (
        <div className="all-cat-item-card">
            <div className="skeleton skeleton-cat-img"></div>
            <div className="skeleton skeleton-cat-text"></div>
        </div>
    );
}
function ProductSkeleton() {
    return (
        <div className="item-card skeleton-card">

            <div className="card-img-wrapper">
                <div className="skeleton skeleton-product-img"></div>
            </div>

            <div className="card-content">
                <div className="skeleton skeleton-product-title"></div>
                <div className="skeleton skeleton-product-price"></div>
            </div>

        </div>
    );
}
export default function MedicineDetailSkeleton() {
    return (
        <div className="med-det-main-card">

            {/* LEFT IMAGE */}
            <div className="med-det-left-section">
                <div className="skeleton skeleton-med-image"></div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="med-det-right-section">

                <div className="skeleton skeleton-med-title"></div>
                <div className="skeleton skeleton-med-store"></div>

                <div className="skeleton skeleton-med-price"></div>

                <div className="skeleton skeleton-med-desc"></div>
                <div className="skeleton skeleton-med-desc"></div>
                <div className="skeleton skeleton-med-desc"></div>

                <div className="skeleton skeleton-med-btn"></div>

            </div>

        </div>
    );
}
function SkeletonDoctorProfile() {
    return (
        <div className="details-page">
            <div className="details-container">

                {/* LEFT SIDEBAR */}
                <div className="profile-sidebar">

                    <div className="skeleton skeleton-img"></div>

                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-badge"></div>

                    <div className="skeleton skeleton-btn"></div>

                </div>

                {/* RIGHT CONTENT */}
                <div className="content-area">

                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="info-section">

                            <div className="skeleton skeleton-heading"></div>

                            <div className="skeleton skeleton-text"></div>
                            <div className="skeleton skeleton-text"></div>
                            <div className="skeleton skeleton-text short"></div>

                        </div>
                    ))}

                </div>

            </div>
        </div>
    );
}
function SkeletonLabCard() {
    return (
        <div className="store-card-6am lab-card">

            <div className="store-image-wrapper">
                <div className="skeleton skeleton-lab-img"></div>
            </div>

            <div className="store-content-vertical">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text short"></div>

                <div className="store-bottom-row">
                    <div className="skeleton skeleton-chip"></div>
                    <div className="skeleton skeleton-chip"></div>
                </div>
            </div>

        </div>
    );
}
export { SkeletonGrid, CategorySkeleton, ProductSkeleton, MedicineDetailSkeleton, SkeletonDoctorProfile, SkeletonLabCard };