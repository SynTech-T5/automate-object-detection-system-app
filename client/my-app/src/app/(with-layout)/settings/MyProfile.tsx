"use client";
import { useState } from "react";

export default function MyProfile() {
  const [activeSub, setActiveSub] = useState<"general">("general");

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
      {/* เมนูย่อยฝั่งซ้าย */}
      <div className="col-span-1 border-r border-gray-200 -mr8">
        <ul className="space-y-2">
          <li>
            <button
  onClick={() => setActiveSub("general")}
  className={`px-3 py-2 rounded-md whitespace-nowrap inline-flex items-center ${
    activeSub === "general"
      ? "bg-blue-100 text-blue-600 font-medium"
      : "text-gray-600 hover:bg-gray-100"
  }`}
>
  My Profile
</button>
          </li>
        </ul>
      </div>

      {/* ฟอร์มฝั่งขวา */}
      <div className="col-span-3 ml-20">
        {activeSub === "general" && (
          <div>
            <h3 className="text-lg font-medium mb-4 text-blue-500 border-b border-gray-200 pb-2 w-full">My Profile</h3>

            <div className="flex items-center gap-x-6 mb-10">
          <label className="w-40 text-sm font-medium text-gray-700">
                Your username
              </label>
              <input
                type="text"
                defaultValue="{usr_username}"
                className="w-full rounded-md border border-gray-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-5"
              />
            </div>

            <div className="flex items-center gap-x-6 mb-10">
          <label className="w-40 text-sm font-medium text-gray-700">
                Your email
              </label>
              <input
                type="email"
                defaultValue="{usr_email}"
                className="w-full rounded-md border border-gray-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-5"
              />
            </div>

            <button className="px-4 py-2 rounded-md bg-gray-400 text-white font-medium hover:bg-gray-500">
              Save Change
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
