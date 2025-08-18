"use client";

import LogoutButton from '../components/LogoutButton';
import BottomCameracard from '../components/bottomCameraCard';
import CameraCard from '../components/cameraCard';
import InputBox from '../components/InputBox';



export default function CamerasPage() {
  return (
    <main className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-semibold">Cameras Page</h1>
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </div>
      <BottomCameracard/>
      <CameraCard/>
      {/* เนื้อหา Cameras ใส่ตรงนี้ */}
    </main>
  );
}
