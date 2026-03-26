import SkeletonText from "./SkeletonText";
import "./skeleton.css";

export default function SkeletonCard() {
    return (
        <div className="doctor-card">
            <div
                className="skeleton"
                style={{
                    width: "100%",
                    height: "200px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                }}
            />

            <SkeletonText width="70%" height={16} />
            <SkeletonText width="50%" />
            <SkeletonText width="40%" />

            <div
                className="skeleton"
                style={{
                    width: "100px",
                    height: "30px",
                    borderRadius: "6px",
                }}
            />
        </div>
    );
}