import "./DeliveryInstructions.css";

const DELIVERY_INSTRUCTIONS = [
  { key: "deliver_to_front_door", label: "Deliver to front door" },
  { key: "deliver_the_reception_desk", label: "Deliver at reception desk" },
  { key: "avoid_calling_phone", label: "Avoid calling phone" },
  { key: "come_with_no_sound", label: "Come quietly (no doorbell)" },
];

export default function DeliveryInstructions({ value = [], onChange }) {
  const toggleInstruction = (key) => {
    if (value.includes(key)) {
      onChange(value.filter((i) => i !== key));
    } else {
      onChange([...value, key]);
    }
  };

  return (
    <div className="checkout-card">
      <h4 className="instruction-header-title">Delivery Instructions</h4>

      <div className="instruction-list">
        {DELIVERY_INSTRUCTIONS.map((item) => {
          const isActive = value.includes(item.key);
          return (
            <label 
              key={item.key} 
              className={`instruction-item ${isActive ? "active-item" : ""}`}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => toggleInstruction(item.key)}
              />
              <span>{item.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}