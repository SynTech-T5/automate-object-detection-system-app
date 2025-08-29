// components/CameraAccess.tsx
import { ReactNode, useState } from "react";
import { LockKeyhole, UserLock, ClockFading, UserStar, ShieldUser, Users } from "lucide-react";

const Toggle = ({ label, enabled, setEnabled }: { label: ReactNode; enabled: boolean; setEnabled: (v: boolean) => void; }) => (
  <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-2">
    {/* min-w-0 ช่วยให้ text หด/ตัดได้ถูกต้องใน grid/flex */}
    <span className="text-gray-700 min-w-0 break-words text-sm sm:text-base">{label}</span>
    <button
      onClick={() => setEnabled(!enabled)}
      className={`justify-self-end w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
        enabled ? "bg-blue-500" : "bg-gray-300"
      }`}
      aria-pressed={enabled}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
          enabled ? "translate-x-5" : ""
        }`}
      />
    </button>
  </div>
);

export default function CameraAccess() {
  const [auth, setAuth] = useState(true);
  const [restrict, setRestrict] = useState(true);
  const [logAccess, setLogAccess] = useState(true);

  return (
    /* เปลี่ยนเป็น single column บนมือถือ แล้วเป็น 2 คอลัมน์ที่ md ขึ้นไป */
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
      {/* Left - Camera Access Permissions */}
      <div>
        <h2 className="text-blue-600 font-semibold mb-4 text-base">Camera Access Permissions</h2>
        
        <Toggle label={
          <span className="flex items-center gap-2">
          <LockKeyhole className="w-5 h-5" /> Require Authentication
          </span>
        } enabled={auth} setEnabled={setAuth} />

        <Toggle label={
          <span className="flex items-center gap-2">
          <UserLock className="w-5 h-5" /> Restrict to Security Personnel
          </span>
        } enabled={restrict} setEnabled={setRestrict} />

        <Toggle label={
          <span className="flex items-center gap-2">
          <ClockFading className="w-5 h-5" /> Log Access Attempts
          </span>
        } enabled={logAccess} setEnabled={setLogAccess} />
      </div>

      {/* Right - User Access Groups */}
      <div>
        <h2 className="text-blue-600 font-semibold mb-4 text-base">User Access Groups</h2>

        <div className="grid grid-cols-[1fr_auto] items-center py-2">
          <span className="flex items-center gap-2 text-gray-700 min-w-0">
            <UserStar className="w-5 h-5 inline-block" /> <span className="min-w-0">Administrators</span>
          </span>
          <span className="justify-self-end px-3 rounded-sm text-sm border border-green-600 bg-green-100 text-green-600 font-medium whitespace-nowrap">
            Full Access
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-center py-2">
          <span className="flex items-center gap-2 text-gray-700 min-w-0">
            <ShieldUser className="w-5 h-5 inline-block" /> <span className="min-w-0">Security Team</span>
          </span>
          <span className="justify-self-end px-3 rounded-sm text-sm border border-blue-600 bg-blue-100 text-blue-600 font-medium whitespace-nowrap">
            View &amp; Control
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-center py-2">
          <span className="flex items-center gap-2 text-gray-700 min-w-0">
            <Users className="w-5 h-5 inline-block" /> <span className="min-w-0">Staff</span>
          </span>
          <span className="justify-self-end px-3 rounded-sm text-sm border border-orange-600 bg-orange-100 text-orange-600 font-medium whitespace-nowrap">
            View Only
          </span>
        </div>
      </div>
    </div>
  );
}
