import "./skeleton.css";

export default function SkeletonText({ width = "100%", height = 12 }) {
    return (
        <div
            className="skeleton"
            style={{
                width,
                height,
                marginBottom: "10px",
            }}
        />
    );
}