"use client";
import React from "react";
import { Swords } from "lucide-react";
import "@/styles/eventCard.css";

export type EventData = {
  evt_id: number;
  evt_icon: string;        // icon class หรือ url
  evt_name: string;        // ชื่อ event
  evt_description: string; // คำอธิบาย
  evt_is_use: number;      // ใช้หรือไม่ (1=เปิด, 0=ปิด)
};

type Props = {
  event: EventData;
};

const EventCard: React.FC<Props> = ({ event }) => {
  const [isUse, setIsUse] = React.useState(event.evt_is_use === 1);
  const [sensitivity, setSensitivity] = React.useState("Medium");

  return (
    <div className="event-card">
      <div className="event-card-header">
        <div className="event-card-header-icon">
          <div className="icon-outer">
            <Swords />
          </div>
        </div>
      </div>

      <div className="event-card-body">
        <h3 className="event-card-body-title">
          {event.evt_name && event.evt_name.trim() !== "" ? event.evt_name : "No name"}
        </h3>
        <p className="event-card-description">{event.evt_description}</p>
        <h3 className="event-card-description">
          {event.evt_description && event.evt_description.trim() !== "" ? event.evt_description : "No desscription"}
        </h3>
        <div className="event-card-footer">
  {/* ซ้ายสุด */}
  <div className="footer-left">
    <span className="enabled-label">Enabled Detection</span>
    <span className="sensitivity-label">Sensitivity</span>
  </div>

  {/* ขวาสุด */}
  <div className="footer-right">
    <label className="switch">
      <input
        type="checkbox"
        checked={isUse}
        onChange={(e) => setIsUse(e.target.checked)}
      />
      <span className="slider round"></span>
    </label>

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

      </div>
    </div>
  );
};

export default EventCard;
