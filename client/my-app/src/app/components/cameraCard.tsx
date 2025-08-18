"use client";
import { useEffect, useState } from "react";
import "@/styles/camera-card.css";

interface Camera {
  cam_id: number;
  cam_name: string;
  cam_is_use: boolean;
  cam_type: string;
  cam_address: string;
  cam_location: string;
  cam_health: string;
}

export default function CameraCards() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/cameras")
      .then((res) => res.json())
      .then((data: Camera[]) => setCameras(data))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>กำลังโหลดรายการกล้อง…</p>;
  if (err) return <p style={{ color: "red" }}>โหลดไม่สำเร็จ: {err}</p>;

  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      {cameras.map((cam) => (
        <div key={cam.cam_id} className="camera-card">
          <div className="camera-card-icon">
            <i className="fi fi-sr-video-camera-alt" aria-hidden="true"></i>
          </div>
        
          <div className="camera-card1">
            <p className="cam-type">{cam.cam_type}</p>
            <h2 className="cam-name">{cam.cam_name}</h2>
            <p className="cam-location">Location</p>
            <p className="cam-address"></p>
            <p className="cam-live">live</p>
            <p className="cam-health">{cam.cam_health}</p>

          </div>

        </div>
      ))}
    </div>
  );
}
