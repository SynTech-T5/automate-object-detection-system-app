"use client";
import { Clock3 as ClockIcon , ArrowUpRight as Iconarrow } from "lucide-react";
import "@/styles/camera-card.css";


    
export default function RecentCard (){
    
    return (
        <div className="w-170 h-65 rounded-lg border border-gray-300 bg-white grid grid-cols-2 shadow-md">
             {/* คอลัมน์ซ้าย: รูป */}
            <div className=" m-5 flex flex-col border border-gray-300 shadow-md bg-gray-100"></div>
            {/* คอลัมน์ขวา: เนื้อหา */}
            <div className="p-5 flex flex-col">
                <span className="text-blue-500 font-semibold">Main Entrance Camera</span>
                <span className="flex items-center text-black-500 mt-[11px]">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    2025-06-03 09:45:22
                </span>
                <span className="flex items-center text-black-500 mt-[11px]">
                    <i className="fi fi-ss-user-key mr-2 text-blue-500"></i>
                     Unauthorized Access
                </span>
                <span className="inline-flex items-center justify-center w-24 h-5  mt-[12px] rounded-sm border border-red-500 bg-red-100 text-[12px] text-red-700">
                    Critical
                </span>
                <span className ="text-gray-500 mt-5 text-[11px]">
                    Unauthorzed individual attemptimg to acccess restricted area
                </span>
                            
                <div className="flex justify-end  mt-[11px]" >
                    <button className="mt-3 px-4 py-1 bg-blue-500 text-white text-[12px] rounded hover:bg-blue-600 transition-colors"> 
                        View Details
                        <Iconarrow className="inline-block ml-2 w-4 h-4 translate-y-[-2px]" />
                    </button>
                </div>


            </div>

        </div>

    );
}