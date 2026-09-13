import React from "react";

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  heading: string;
  description: string;
  icon?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
};

export default function Dialog({
  isOpen,
  onClose,
  onConfirm,
  heading,
  description,
  icon,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "bg-blue-600 hover:bg-blue-700 text-white",
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Standalone Card container */}
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl flex flex-col items-center text-center gap-4">
        {/* Optional Icon */}
        {icon && <div className="text-4xl">{icon}</div>}

        {/* Header & Body */}
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-gray-800">{heading}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full mt-2">
          {/* Cancel / Secondary Action */}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition cursor-pointer"
          >
            {cancelText}
          </button>

          {/* Confirm / Primary Action */}
          <button
            type="button"
            onClick={onConfirm || onClose}
            className={`flex-1 h-10 rounded-xl font-medium transition cursor-pointer ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}