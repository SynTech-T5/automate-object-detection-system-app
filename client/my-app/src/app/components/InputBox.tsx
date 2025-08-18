"use client"; 

import { useState } from "react"; 
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';


export default function CameraForm() {
  
  const [form, setForm] = useState({
    cameraName: "", // ชื่อกล้อง
    ipAddress: "",  // IP Address ของกล้อง
    description: "", // รายละเอียดเพิ่มเติม
    eventName: "",   // ชื่อเหตุการณ์
  });

  // ฟังก์ชัน handleChange ใช้กับ input/textarea ทุกตัว
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // คัดลอก state เดิมแล้วอัปเดต field ที่เปลี่ยน
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // JSX return UI ของฟอร์ม
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-2">
    
      <div> {/* กล่อง camera บนสุด*/}
        <label className="block text-sm font-medium mb-1 text-gray-600">Camera</label> 
        <button className="w-full sm:w-auto border rounded-lg px-4 py-2 bg-blue-50 text-blue-400 font-medium">
          Main Entrance Camera 
        </button>
        {/* 
          w-full -> มือถือเต็มความกว้าง
          sm:w-auto -> จอใหญ่พอดีกับข้อความ
          border -> เส้นขอบ
          rounded-lg -> มุมโค้ง
          px-4 py-2 -> padding ขอบใน
          bg-blue-50 -> พื้นฟ้าอ่อน
          text-blue-400 -> ตัวอักษรฟ้าอ่อน
          font-medium -> ตัวอักษรหนาปานกลาง
        */}
      </div>

      {/* กล่อง Camera Name + IP Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* grid-cols-1 -> มือถือ 1 คอลัมน์
            md:grid-cols-2 -> จอ ≥768px 2 คอลัมน์
            gap-4 -> เว้นระยะห่างระหว่างคอลัมน์ */}

        {/* Camera Name ชื่อกล้อง */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-600">
            Camera Name<span className="text-blue-500">*</span>
          </label>
          <input
            type="text"
            name="cameraName"
            placeholder="Enter camera name"
            value={form.cameraName} // ผูกค่ากับ state
            onChange={handleChange} // อัปเดต state เมื่อกรอก
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>


        {/* IP Address */}
        <div> 
          <label className="block text-sm font-medium mb-1 text-gray-600">
            IP Address<span className="text-blue-500">*</span>
          </label>

          {/* กล่อง dropdown + input */}
          <div className="flex">
            <div className="flex items-center border rounded-lg overflow-hidden w-full ">
              
              {/* Dropdown เลือกประเภท */}
              <select className="px-3 py-2">
                <option>IP</option>
              </select>
              {/* px-3 py-2 -> padding ขอบใน */}

              {/* เส้นคั่นกลาง */}
              <div className="w-px bg-gray-300 h-6 self-center mx-3"></div>
              {/* 
                 self-center -> กึ่งกลางแนวตั้ง
                 h-6 -> ความสูงเส้น
                 mx-3 -> เว้นขอบซ้ายขวา
              */}
              
              {/* ช่องกรอก IP */}
              <input
                type="text"
                name="ipAddress"
                value={form.ipAddress} // ผูกค่ากับ state
                onChange={handleChange} // อัปเดต state
                className="flex-1 px-3 py-2 outline-none"
              />
              {/* 
                flex-1 -> ขยายเต็มพื้นที่ที่เหลือ
                px-3 py-2 -> padding ขอบใน
                outline-none -> ไม่แสดงเส้น outline เวลา focus
              */}
            </div>
          </div>
        </div>
      </div>



      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-600">Description</label>
        <textarea
          name="description"
          placeholder="Enter camera description"
          value={form.description} // ผูกค่ากับ state
          onChange={handleChange} // อัปเดต state
          className="w-full border rounded-lg px-3 py-2 h-24"
        />
      </div>

      

      {/* Event Name */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-600  ">
          Event Name<span className="text-blue-500">*</span>
        </label>

        <div className="flex items-center border rounded-lg overflow-hidden ">
          {/* ปุ่ม Upload Icon */}
          <button className="text-sm px-3 py-2 bg-white  whitespace-nowrap">
            Upload Icon
          </button>
        
           {/* เส้นคั่นกลาง */}
              <div className="w-px bg-gray-300 h-6 self-center mx-1"></div>
              
          {/* ช่องกรอกชื่อ Event */}
          <input
            type="text"
            name="eventName"
            placeholder="Enter event name"
            value={form.eventName} // ผูกค่ากับ state
            onChange={handleChange} // อัปเดต state
            className="flex-1 px-3 py-2  outline-none" // flex-1 -> ขยายเต็มพื้นที่ที่เหลือ  px-3 py-2 -> padding
          />
        </div>
      </div>



         <div>
        <label className="block text-sm font-medium mb-1 text-gray-600">
            
        </label>

        <div className="relative">
            {/* ไอคอนค้นหา */}
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
            <input
            type="text"
            name="cameraName"
            placeholder="Search"
            value={form.cameraName}
            onChange={handleChange}
            className="w-full border border-blue-400 rounded-lg px-10 py-2 placeholder-blue-400"

            />
        </div>
        </div>

    </div>


  );
}
