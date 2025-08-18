"use client";
import "@/styles/camera-card.css";

export default function BottomCameraCard() {
  return (
    <div className="absolute left-4 right-4 bottom-4 flex min-w-0">
      {/* View */}
      <button
        className="flex-grow group inline-flex items-center justify-center gap-2 border border-[rgb(170,170,170)] rounded-l-lg
                   px-3 py-1 text-sm md:text-base text-gray-700 hover:bg-blue-50 hover:border-blue-500
                   focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
       <i className="fi fi-tr-eye-lashes leading-none text-current group-hover:text-blue-600 text-[15px] md:text-[15px]" />
        <span className="group-hover:text-blue-600 text-[10px]">View</span>
      </button>

      {/* Edit */}
      <button
        type="button"
        aria-label="Edit"
        className="flex-grow group inline-flex items-center justify-center gap-2 border border-[rgb(170,170,170)]
                   px-3 py-1 text-sm md:text-base text-gray-700 hover:bg-blue-50 hover:border-blue-500
                   focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <i className="fi fi-tr-pen-field text-current leading-none group-hover:text-blue-600 text-[15px] md:text-[15px]" />
        <span className="transition-colors group-hover:text-blue-600 text-[10px]">Edit</span>
      </button>

      {/* Details */}
      <button
        type="button"
        aria-label="Details"
        className="flex-grow group inline-flex items-center justify-center gap-2 border border-[rgb(170,170,170)]
                   px-3 py-1 text-sm md:text-base text-gray-700 hover:bg-blue-50 hover:border-blue-500
                   focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <i className="fi fi-tr-info text-current leading-none group-hover:text-blue-600 text-[15px] md:text-[15px]" />
        <span className="transition-colors group-hover:text-blue-600 text-[10px]">Details</span>
      </button>

      {/* Delete */}
      <button
        type="button"
        aria-label="Delete"
        className="group inline-flex items-center justify-center gap-2 border border-[rgb(170,170,170)] rounded-r-lg
                   px-3 py-1 text-sm md:text-base text-gray-700 hover:bg-red-100 hover:border-red-500
                   focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
      >
        <i className="fi fi-rr-trash text-current leading-none group-hover:text-red-600 text-[18px] md:text-[15px]" />
      </button>
    </div>
  );
}
