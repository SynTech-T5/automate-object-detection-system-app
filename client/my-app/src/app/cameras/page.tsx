"use client";

import LogoutButton from '../components/LogoutButton';
import CameraCard from '../components/CameraCard';

export default function CamerasPage() {
  return (
    <main className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-semibold">Cameras Page</h1>
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </div>
      <CameraCard/>
      
      {/* เนื้อหา Cameras ใส่ตรงนี้ */}
    </main>
  );
}
