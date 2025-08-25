"use client"
import { useState } from "react";

const SettingsPage = () => {
  const [activeMenu, setActiveMenu] = useState("methods");
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const toggleSelection = (id: string, type: "methods" | "recipients") => {
    if (type === "methods") {
      setSelectedMethods((prev) =>
        prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
      );
    } else {
      setSelectedRecipients((prev) =>
        prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
      );
    }
  };

  const handleSave = () => {
    console.log("Selected Methods:", selectedMethods);
    console.log("Selected Recipients:", selectedRecipients);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">


      {/* Two Column Layout */}
      <div className="grid grid-cols-4 gap-0">
        {/* Left Sidebar */}
        <div className="col-span-1 border-r pr-4 text-sm space-y-2 -mr8">
  <p
    className={`px-3 py-2 rounded-md whitespace-nowrap inline-flex items-center ${
      activeMenu === "methods"
        ? "bg-blue-100 text-blue-600 font-medium"
        : "text-gray-600 hover:bg-gray-100"
    }`}
    onClick={() => setActiveMenu("methods")}
  >
    Notification Methods
  </p>
  <p
    className={`px-3 py-2 rounded-md whitespace-nowrap inline-flex items-center ${
      activeMenu === "rules"
        ? "bg-blue-100 text-blue-600 font-medium"
      : "text-gray-600 hover:bg-gray-100"
    }`}
    onClick={() => setActiveMenu("rules")}
  >
    Alert Rules
  </p>
  <p
    className={`px-3 py-2 rounded-md whitespace-nowrap inline-flex items-center ${
      activeMenu === "recipients"
        ? "bg-blue-100 text-blue-600 font-medium"
      : "text-gray-600 hover:bg-gray-100"
    }`}
    onClick={() => setActiveMenu("recipients")}
  >
    Notification Recipients
  </p>
</div>


        {/* Right Content */}
        <div className="col-span-3 ml-20">
          {/* Notification Methods */}
          {activeMenu === "methods" && (
  <>
    <h2 className="text-lg font-medium mb-4 text-blue-500 border-b border-gray-200 pb-2 w-full">
      Notification Methods
    </h2>

    <div className="flex flex-col items-start gap-6">
  {/* Checkbox 1 */}
  <label className="flex items-start gap-x-3 relative">
    <input
      type="checkbox"
      checked={selectedMethods.includes("inApp")}
      onChange={() => toggleSelection("inApp", "methods")}
      className="mt-1"
    />
    {/* เส้นแนวดิ่ง */}
    <span className="absolute block w-px h-9 bg-gray-300 mt-2 mb-2 top-5 bottom-6 left-1.5"></span>
    <div>
      <span className="font-medium">In-App Notifications</span>
      <p className="text-sm text-gray-500 mr-1">
        Receive notifications within the security dashboard application
      </p>
    </div>
  </label>

  {/* Checkbox 2 */}
  <label className="flex items-start gap-x-3 relative">
    <input
      type="checkbox"
      checked={selectedMethods.includes("email")}
      onChange={() => toggleSelection("email", "methods")}
      className="mt-1"
    />
    <span className="absolute block w-px h-9 bg-gray-300 mt-2 mb-2 top-5 bottom-6 left-1.5"></span>
    <div>
      <span className="font-medium">Email Notifications</span>
      <p className="text-sm text-gray-500">
        Receive email alerts for security incidents
      </p>
    </div>
  </label>

  {/* Checkbox 3 */}
  <label className="flex items-start gap-x-3 relative">
    <input
      type="checkbox"
      checked={selectedMethods.includes("sms")}
      onChange={() => toggleSelection("sms", "methods")}
      className="mt-1"
    />
    <span className="absolute block w-px h-8 bg-gray-300 mt-2 mb-2 top-5 bottom-6 left-1.5"></span>
    <div>
      <span className="font-medium">SMS Notifications</span>
      <p className="text-sm text-gray-500">
        Receive text message alerts for critical security incidents
      </p>
    </div>
  </label>
</div>

  </>
)}


          {/* Notification Recipients */}
          {activeMenu === "recipients" && (
            <>
              <h2 className="text-lg font-semibold mb-4 text-blue-500">
                Notification Recipients
              </h2>

              <div className="space-y-4">
                <label className="flex items-start gap-x-3">
                  <input
                    type="checkbox"
                    checked={selectedRecipients.includes("admin")}
                    onChange={() => toggleSelection("admin", "recipients")}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium">Admin</span>
                    <p className="text-sm text-gray-500">
                      Primary security personnel responsible for immediate response
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-x-3">
                  <input
                    type="checkbox"
                    checked={selectedRecipients.includes("security")}
                    onChange={() => toggleSelection("security", "recipients")}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium">Security Officer</span>
                    <p className="text-sm text-gray-500">
                      Facility and security management personnel
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-x-3">
                  <input
                    type="checkbox"
                    checked={selectedRecipients.includes("staff")}
                    onChange={() => toggleSelection("staff", "recipients")}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium">Staff</span>
                    <p className="text-sm text-gray-500">
                      Staff security team for technical issues and system alerts
                    </p>
                  </div>
                </label>
              </div>
            </>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
            disabled={
              activeMenu === "methods"
                ? selectedMethods.length === 0
                : selectedRecipients.length === 0
            }
          >
            Save Change
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
