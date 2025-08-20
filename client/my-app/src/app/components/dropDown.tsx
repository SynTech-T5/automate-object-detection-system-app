"use client";
import { useState } from "react";

import "@/styles/dropdown.css";   // import CSS

export default function DropDown() {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [open4, setOpen4] = useState(false);
  const [open5, setOpen5] = useState(false); // เพิ่ม state ให้ dropdown อันใหม่
    const [severity, setSeverity] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* แถวแรก มี 4 dropdown */}
      <div style={{ display: "flex", gap: "1rem" }}>
        {/* Dropdown อันแรก */}
        <div className="dropdown">
          <button onClick={() => setOpen1(!open1)} className="dropdown-button">
            All Severitie
            {open1 ? (
              <i className="fi fi-tr-angle-small-up arrow"></i>
            ) : (
              <i className="fi fi-tr-angle-small-down arrow"></i>
            )}
          </button>
          {open1 && (
            <div className="dropdown-menu">
              <ul>
                <li><a href="#">Critical</a></li>
                <li><a href="#">High</a></li>
                <li><a href="#">Medium</a></li>
                <li><a href="#">Low</a></li>
              </ul>
            </div>
          )}
        </div>

        {/* Dropdown อันที่สอง */}
        <div className="dropdown">
          <button onClick={() => setOpen2(!open2)} className="dropdown-button">
            All Statuses
            {open2 ? (
              <i className="fi fi-tr-angle-small-up arrow"></i>
            ) : (
              <i className="fi fi-tr-angle-small-down arrow"></i>
            )}
          </button>
          {open2 && (
            <div className="dropdown-menu">
              <ul>
                <li><a href="#">Active</a></li>
                <li><a href="#">Resolved</a></li>
                <li><a href="#">Dismissed</a></li>
              </ul>
            </div>
          )}
        </div>

        {/* Dropdown อันที่สาม */}
        <div className="dropdown">
          <button onClick={() => setOpen3(!open3)} className="dropdown-button">
            All Cameras
            {open3 ? (
              <i className="fi fi-tr-angle-small-up arrow"></i>
            ) : (
              <i className="fi fi-tr-angle-small-down arrow"></i>
            )}
          </button>
          {open3 && (
            <div className="dropdown-menu">
              <ul>
                <li><a href="#">ประเภท 1</a></li>
                <li><a href="#">ประเภท 2</a></li>
                <li><a href="#">ประเภท 3</a></li>
              </ul>
            </div>
          )}
        </div>

        {/* Dropdown อันที่สี่ */}
        <div className="dropdown">
          <button onClick={() => setOpen4(!open4)} className="dropdown-button">
            All Event Type
            {open4 ? (
              <i className="fi fi-tr-angle-small-up arrow"></i>
            ) : (
              <i className="fi fi-tr-angle-small-down arrow"></i>
            )}
          </button>
          {open4 && (
            <div className="dropdown-menu">
              <ul>
                <li><a href="#">Unauthorized Access</a></li>
                <li><a href="#">Suspicious Behavior</a></li>
                <li><a href="#">Object Detection</a></li>
                <li><a href="#">Motion Detection</a></li>
                <li><a href="#">Camera Tampering</a></li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* แถวสอง มีปุ่ม dropdown ใหม่ */}
        {/* Field: Severity */}
        <div className="field">
        <label className="field-label">
            Severity<span className="req">*</span>
        </label>

        <div className={`select ${open5 ? "open" : ""}`}>
            <button
            type="button"
            onClick={() => setOpen5(!open5)}
            className="select-trigger"
            aria-haspopup="listbox"
            aria-expanded={open5}
            >
            <span className={`value ${!severity ? "placeholder" : ""}`}>
                {severity || "{alr_severity}"}
            </span>
            <i className="fi fi-tr-angle-small-down chevron" />
            </button>

            {open5 && (
            <ul className="select-menu" role="listbox">
                {["1", "2", "3", "4"].map((opt) => (
                <li key={opt}>
                    <button
                    type="button"
                    className="select-option"
                    onClick={() => {
                        setSeverity(opt);
                        setOpen5(false);
                    }}
                    role="option"
                    aria-selected={severity === opt}
                    >
                    {opt}
                    </button>
                </li>
                ))}
            </ul>
            )}
        </div>
        </div>


      </div>
    
  );
}
