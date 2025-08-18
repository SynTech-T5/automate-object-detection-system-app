import { useState } from "react";
import "./EventCard.css";

type EventCardProps = {
  icon: string; // className ของ Flaticon icon
  title: string;
  description: string;
};

export default function EventCard({ icon, title, description }: EventCardProps) {
  const [enabled, setEnabled] = useState(false);
  const [sensitivity, setSensitivity] = useState("Medium");

  return (
    <div className="event-card">
      {/* Icon + Title */}
      <div className="event-card-header">
        <div className="event-card-icon">
          <i className={icon}></i>
        </div>
        <h2 className="event-card-title">{title}</h2>
      </div>

      {/* Description */}
      <p className="event-card-description">{description}</p>

      {/* Enable toggle */}
      <div className="event-card-row">
        <span className="label">Enable Detection</span>
        <label className="toggle">
          <input
            type="checkbox"
            checked={enabled}
            onChange={() => setEnabled(!enabled)}
          />
          <span className="slider"></span>
        </label>
      </div>

      {/* Sensitivity select */}
      <div className="event-card-select">
        <label className="label">Sensitivity</label>
        <select
          value={sensitivity}
          onChange={(e) => setSensitivity(e.target.value)}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
    </div>
  );
}
