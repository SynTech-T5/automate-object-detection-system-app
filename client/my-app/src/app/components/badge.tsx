'use client'; // บอก Next.js ว่านี่คือ client component
import React from "react";
import { Anchor } from "lucide-react";
import { Video } from "lucide-react";
import { MapPin } from 'lucide-react';

const App: React.FC = () => {
  return (
    // Container หลักของ badge แต่ละอัน
    // flex flex-col → ให้เรียงแนวตั้ง
    // space-y-4 → เว้นระยะห่างระหว่างแต่ละบรรทัด
    <div className="p-6 space-y-4 font-sans flex flex-col">


      {/* Inactive Badge */}
      <span 
        className="block px-1 py-0.5 border-2 border-red-500 text-red-500 rounded-lg font-semibold text-sm text-center max-w-[80px] bg-red-100"
      >
        Inactive
      </span>

      {/* CAM001 Badge */}
      <span 
        className="block px-1 py-1 border-2 border-blue-500 text-blue-500 rounded-full font-semibold text-sm text-center max-w-[80px] bg-blue-200"
      >
        CAM001
      </span>

      {/* Live Badge */}
      <span 
        className="flex items-center px-3 py-1 bg-red-500 text-white rounded-full font-bold text-base text-center max-w-[80px]"
      >
        {/* จุดสีขาวเล็ก ๆ แสดงสถานะ live */}
        <span className="w-3 h-3 bg-white rounded-full mr-2"></span>
        Live
      </span>

      {/* Live แบบไม่มีไอคอน */}
      <span 
        className="flex items-center justify-center px-3 py-1 bg-red-500 text-white rounded-full font-bold text-base text-center max-w-[80px]"
      >
        Live
      </span> 


      {/* Fixed Badge (มีไอคอน) */}
      <span className="flex items-center justify-center  px-3 py-0.5 border-2 border-green-500 text-green-500 bg-green-200 rounded-md font-bold text-sm  max-w-[80px]">
        <Anchor className="w-4 h-4 mr-1" />   {/* ขนาด 16px + margin ขวา */}
        Fixed
      </span>

      {/* Fixed Badge (ไม่มีไอคอน) */}
      <span className="flex  justify-center px-3 py-0.5 border-2 border-green-500 text-green-500 bg-green-200 rounded-md font-bold text-sm max-w-[80px]">
        Fixed
      </span>



      {/* Health Badge(มีไอคอน) */}
      <span className="flex items-center justify-center  px-3 py-0.5 border-2 border-green-500 text-green-500 bg-green-200 rounded-md font-bold text-sm  max-w-[140px]">
        <Video className="w-4 h-4 mr-1" />   {/* ขนาด 16px + margin ขวา */}
        Health: 100%
      </span>

      {/* Health Badge (ไม่มีไอคอน) */}
      <span className="flex  justify-center px-3 py-0.5 border-2 border-green-500 text-green-500 bg-green-200 rounded-md font-bold text-sm max-w-[140px]">
        Health: 100%
      </span>

      


      {/* Location Badge */}
      <span 
        className="flex items-center px-3 py-0.5 border-2 border-gray-400 text-gray-600 rounded-full font-medium text-sm text-center">
        <MapPin class="w-4 h-4 mr-2"/>
        Dormitory Entrance
      </span>

      {/* Location Badge แบบไม่มีไอคอน*/}
      <span 
        className="flex items-center justify-center px-3 py-0.5 border-2 border-gray-400 text-gray-600 rounded-full font-medium text-sm text-center">
        Dormitory Entrance 
      </span>
    </div>
  );
};

export default App;
