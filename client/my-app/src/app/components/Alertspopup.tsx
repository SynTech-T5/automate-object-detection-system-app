import React, { useState, useRef, useEffect } from "react";
import { Trash2, Pencil, AlertTriangle, WandSparkles } from "lucide-react";

type SimpleModalAlertProps = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: (textValue: string) => void;
  onCancel: () => void;
  showTextarea?: boolean;
  textareaPlaceholder?: string;
  customHeight?: string;
  confirmButtonClass?: string;
  hideCancelButton?: boolean;
};

const SimpleModalAlert = ({
  icon,
  iconBg,
  title,
  description,
  confirmText,
  onConfirm,
  onCancel,
  showTextarea = false,
  textareaPlaceholder = "Enter your message...",
  customHeight = "",
  confirmButtonClass = "bg-gray-400",
  hideCancelButton = false,
}: SimpleModalAlertProps) => {
  const [textValue, setTextValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ✅ Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // reset height
      textarea.style.height = textarea.scrollHeight + "px"; // set height to content
    }
  }, [textValue]);

  return (
    <div className={`bg-white rounded-lg shadow px-4 py-2 w-full max-w-md text-center ${customHeight}`}>
      <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>

      <h3 className="font-semibold mb-2">{title}</h3>

      <p className="text-gray-500 text-sm mb-4 whitespace-pre-line">{description}</p>

      {showTextarea && (
        <div className="w-full max-w-sm mx-auto mb-4">
          <p className="text-left text-sm text-gray-700 mb-1 px-1">
            To confirm, type cam_name in the box below
          </p>
          <textarea
            ref={textareaRef}
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder={textareaPlaceholder}
            className="w-full max-w-sm border border-gray-200 text-gray-800 px-3 py-1 mb-4 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={1}
            style={{ borderRadius: "5px" }}
          />
        </div>
      )}

      <div className="flex justify-center gap-3">
        <button
          onClick={() => onConfirm(textValue)}
          style={{ borderRadius: "5px" }}
          className={`px-4 py-0.5 text-white rounded hover:opacity-90 ${confirmButtonClass}`}
        >
          {confirmText}
        </button>
        {!hideCancelButton && (
          <button
            onClick={onCancel}
            style={{ borderRadius: "5px" }}
            className="px-4 py-0.5 border rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// ใช้งาน
const SimpleAlertsGrid = () => (
  <div className="bg-blue-50 p-8 min-h-screen grid grid-cols-1 md:grid-cols-2 gap-3">
    <SimpleModalAlert
      icon={<Trash2 className="w-6 h-6 text-red-600" />}
      iconBg="bg-red-200"
      title="Delete Camera?"
      description={`Deleting your camera is irreversible and will erase all your data. This action cannot be undone.`}
      confirmText="Delete"
      confirmButtonClass="bg-gray-400"
      showTextarea={true}
      textareaPlaceholder="Enter camera name"
      onConfirm={(text) => alert("Deleted with input: " + text)}
      onCancel={() => alert("Canceled")}
      customHeight="h-80"
    />

    <SimpleModalAlert
      icon={<Pencil className="w-6 h-6 text-blue-600" />}
      iconBg="bg-blue-200"
      title="Update Account"
      description={`Deleting your camera is irreversible and will erase all your data. This action cannot be undone.`}
      confirmText="Save"
      confirmButtonClass="bg-blue-600"
      onConfirm={() => alert("Saved")}
      onCancel={() => alert("Canceled")}
      customHeight="h-64"
    />

    <SimpleModalAlert
      icon={<AlertTriangle className="w-6 h-6 text-yellow-600" />}
      iconBg="bg-yellow-200"
      title="Warning!"
      description={`Deleting your camera is irreversible and will erase all your data. This action cannot be undone.`}
      confirmText="Retry"
      confirmButtonClass="bg-yellow-500 text-black"
      onConfirm={() => alert("Retried")}
      onCancel={() => alert("Canceled")}
      customHeight="h-52"
      hideCancelButton={true}
    />

    <SimpleModalAlert
      icon={<WandSparkles className="w-6 h-6 text-green-600" />}
      iconBg="bg-green-200"
      title="Create Account"
      description={`Deleting your camera is irreversible and will erase all your data. This action cannot be undone.`}
      confirmText="Create"
      confirmButtonClass="bg-green-600"
      onConfirm={() => alert("Created")}
      onCancel={() => alert("Canceled")}
      customHeight="h-54"
    />
  </div>
);

export default SimpleAlertsGrid;