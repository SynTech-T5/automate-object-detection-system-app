import React from 'react';
import { Badge, Check, Pencil, AlertTriangle, XCircle } from 'lucide-react';

type IconCircleProps = {
  icon: React.ReactNode;
  overlayIcon?: React.ReactNode;
  borderColor: string;
};

const IconCircle = ({ icon, overlayIcon, borderColor }: IconCircleProps) => (
  <div
    className={`relative flex items-center justify-center w-12 aspect-square rounded-full bg-white  shadow-md ${borderColor}`}
  >
    {/* ไอคอนหลักห่อด้วย container ควบคุมขนาด */}
    <div className="w-2/3 h-2/3 flex items-center justify-center">
      {icon}
    </div>

    {/* ไอคอนซ้อน (ถ้ามี) */}
    {overlayIcon && (
      <div className="absolute w-1/3 h-1/3 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {overlayIcon}
      </div>
    )}
  </div>
);

// ✅ Success Alert
const SuccessAlert = () => (
  <div className="inline-flex items-center  max-w-full p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
    <IconCircle
      borderColor="border-green-500"
      icon={<Badge className="w-full h-full text-green-500" />}
      overlayIcon={<Check className="w-full h-full text-green-500" />}
    />
    <div className="ml-6">
      <div className="font-semibold">Successfully</div>
      <p className="text-sm mt-1">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequatur, libero.
      </p>
    </div>
  </div>
);

// 🔵 Updated Alert
const UpdatedAlert = () => (
  <div className="inline-flex items-center  max-w-full p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md">
    <IconCircle
      borderColor="border-blue-500"
      icon={<Pencil className="w-full h-full text-blue-500" />}
    />
    <div className="ml-6">
      <div className="font-semibold">Updated</div>
      <p className="text-sm mt-1">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequatur, libero.
      </p>
    </div>
  </div>
);

// 🟡 Warning Alert
const WarningAlert = () => (
  <div className="inline-flex items-center  max-w-full p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
    <IconCircle
      borderColor="border-yellow-500"
      icon={<AlertTriangle className="w-full h-full text-yellow-500" />}
    />
    <div className="ml-6">
      <div className="font-semibold">Warning!!!</div>
      <p className="text-sm mt-1">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequatur, libero.
      </p>
    </div>
  </div>
);

// 🔴 Failed Alert
const FailedAlert = () => (
  <div className="inline-flex items-center  max-w-full p-4 bg-red-100 border border-red-400 text-red-600 rounded-md">
    <IconCircle
      borderColor="border-red-500"
      icon={<XCircle className="w-full h-full text-red-500" />}
    />
    <div className="ml-6">
      <div className="font-semibold">Failed</div>
      <p className="text-sm mt-1">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequatur, libero.
      </p>
    </div>
  </div>
);

// รวมทุก Alert
const Alerts = () => (
  <div className="space-y-6 p-6 bg-gray-50 min-h-screen flex flex-col items-center">
    <SuccessAlert />
    <UpdatedAlert />
    <WarningAlert />
    <FailedAlert />
  </div>
);

export default Alerts;