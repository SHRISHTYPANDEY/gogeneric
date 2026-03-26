import "./Skeleton.css";

export default function CheckoutSkeleton() {
    return (
        <div className="checkout-container">

            <div className="skeleton skeleton-title"></div>

            <div className="checkout-layout">

                <div className="checkout-left">

                    <div className="skeleton skeleton-card"></div>
                    <div className="skeleton skeleton-card"></div>
                    <div className="skeleton skeleton-card"></div>
                    <div className="skeleton skeleton-card"></div>

                </div>

                <div className="checkout-right">
                    <div className="skeleton skeleton-summary"></div>
                </div>

            </div>

        </div>
    );
}