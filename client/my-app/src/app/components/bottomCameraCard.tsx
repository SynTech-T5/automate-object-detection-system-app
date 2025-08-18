"use client";
import "@/styles/bottomcameara.css";

export default function BottomCameraCard() {
  return (
    <div className="flex mt-4">
      // View 
      <button
        type="button"
        aria-label="View"
        className="group inline-flex items-center gap-2 border border-[rgb(170,170,170)] rounded-l-lg px-4 py-1
                   text-gray-700 hover:bg-blue-50 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                   transition-colors"
      >
        <i className="fi fi-rs-eye text-current transition-colors group-hover:text-blue-600 translate-y-[3px]" />
        <span className="transition-colors group-hover:text-blue-600">View</span>
      </button>

      {/* Edit */}
      <button
        type="button"
        aria-label="Edit"
        className="group inline-flex items-center gap-2 border border-[rgb(170,170,170)] px-4 py-1
                   text-gray-700 hover:bg-blue-50 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                   transition-colors"
      >
        {/* ถ้าไอคอนนี้ไม่ขึ้น ตรวจว่าลิงก์ชุดไอคอน fi-tr-* ถูกโหลด หรือเปลี่ยนเป็น fi-rs-edit */}
        <i className="fi fi-rs-pen-field text-current transition-colors group-hover:text-blue-600 translate-y-[1px]" />
        <span className="transition-colors group-hover:text-blue-600">Edit</span>
      </button>

      {/* Details */}
      <button
        type="button"
        aria-label="Details"
        className="group inline-flex items-center gap-2 border border-[rgb(170,170,170)] px-2 py-1
                   text-gray-700 hover:bg-blue-50 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                   transition-colors"
      >
        <i className="fi fi-rs-info text-current transition-colors group-hover:text-blue-600 translate-y-[2px]" />
        <span className="transition-colors group-hover:text-blue-600">Details</span>
      </button>

      {/* Delete */}
      <button
        type="button"
        aria-label="Delete"
        className="group inline-flex items-center gap-2 border border-[rgb(170,170,170)] rounded-r-lg px-2.5 py-1
                   text-gray-700 hover:bg-red-100 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500
                   transition-colors "
      >
        <i className="fi fi-rs-trash text-current transition-colors group-hover:text-red-600 translate-y-[2px]  translate-x-[3px]" />
        <span className="transition-colors group-hover:text-blue-50"></span>
      </button>
    </div>
  );
}
