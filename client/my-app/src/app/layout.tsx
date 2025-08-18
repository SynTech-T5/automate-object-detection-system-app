import React from "react";
import "./Layout.css";

export default function layout() {
  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">📹</div>
        <nav>
          <button title="Cameras">📷</button>
          <button title="Reports">📊</button>
          <button title="Settings">⚙️</button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main">
        {/* Topbar */}
        <header className="topbar">
          <h1 className="system-title">CCTV Analytics System</h1>
          <div className="topbar-right">
            <span className="datetime">Fri, Jul 18, 2025 at 10:08:19 PM</span>
            <span className="user">👤 Admin</span>
          </div>
        </header>

        {/* Content */}
        <div className="content">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h2>Camera Management</h2>
              <p>Manage and monitor all security cameras in the system</p>
            </div>
            <button className="btn-primary">+ Add New Camera</button>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="card">
              <h3>Total Cameras</h3>
              <p className="number">8</p>
            </div>
            <div className="card">
              <h3>Active Cameras</h3>
              <p className="number green">7 / 8</p>
            </div>
            <div className="card">
              <h3>Inactive Cameras</h3>
              <p className="number red">1</p>
            </div>
            <div className="card">
              <h3>Avg. Camera Health</h3>
              <p className="number yellow">83%</p>
            </div>
          </div>

          {/* Camera Management Section */}
          <div className="camera-section">
            <div className="toolbar">
              <input type="text" placeholder="Search" />
              <select>
                <option>All Status</option>
              </select>
              <select>
                <option>All Locations</option>
              </select>
              <select>
                <option>All Types</option>
              </select>
              <button>List View</button>
              <button>Refresh</button>
            </div>

            {/* กล่องกล้องต่าง ๆ */}
            <div className="camera-list">
              <div className="camera-card">Camera A</div>
              <div className="camera-card">Camera B</div>
              <div className="camera-card">Camera C</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
