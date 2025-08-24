"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import CameraCard from "./cameraCard";
import InputBox from "./inputBox";

interface Camera {
    id: number;
    name: string;
    address: string;
    type: string;
    status: boolean;
    health: number;
    location: {
        id: number;
        name: string;
    }
};

export default function CamerasGrid({ cameras }: { cameras: Camera[]}){
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("all");
    const [location, setLocation] = useState("all");
    const [type, setType] = useState("all");


    const locations = Array.from(new Set(cameras.map(cam => cam.location.name)));
    const typeCameras = Array.from(new Set(cameras.map(cam => cam.type)));

    const filtered = cameras.filter((cam) => {
      const searchInput =
      cam.name.toLowerCase().includes(query.toLowerCase())||
      cam.location.name.toLowerCase().includes(query.toLowerCase())||
      cam.id.toString().includes(query);

      const filterStatus =
      status === "all" || cam.status === (status === "true");

      const filterLocation =
      location === "all" || cam.location.name === location;

      const filterTypeCameras = 
      type === "all" || cam.type === type;
    
      return searchInput && filterStatus && filterLocation && filterTypeCameras;
    });

    return(
    <div className="space-y-3">
      <div className="w-full flex flex-col sm:flex-row items-center gap-6">
      {/* Search box */}
      <InputBox
        value={query}
        onChange={setQuery} 
        placeholder="Search"
      />
        {/* Dropdown filter status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-blue-500 text-white font-medium rounded-md 
             px-3 py-2 shadow-sm outline-none 
             w-full sm:w-[120px] h-[32px] text-xs leading-[30px]"
        >
          <option value="all">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        {/* Dropdown filter location */}  
        <select
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="bg-blue-500 text-white font-medium rounded-md 
             px-3 py-2 shadow-sm outline-none 
             w-full sm:w-[130px] h-[32px] text-xs leading-[30px]"
        >
          <option value="all">All Locations</option>
          {locations.map((loc)=>(
            <option key = {loc} value = {loc}>
              {loc}
            </option>

          ))}
        </select>
        {/* Dropdown filter Type */} 
        <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="bg-blue-500 text-white font-medium rounded-md 
             px-3 py-2 shadow-sm outline-none 
             w-full sm:w-[130px] h-[32px] text-xs leading-[30px]"
        >
          <option value="all">All Types</option>
          {typeCameras.map((type)=>(
            <option key = {type} value = {type}>
              {type}
            </option>
          ))}
        </select>


      </div>
    <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {filtered.length > 0 ? (
        filtered.map((cam) => 
        <CameraCard key={cam.id} cam={cam} />)
      ) : (
        <p className="text-gray-500">No cameras found</p>
      )}
    </div>
    </div>      
    );

}