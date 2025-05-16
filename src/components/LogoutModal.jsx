// components/LogoutModal.jsx
import React from 'react';

export default function LogoutModal({ onConfirm, onCancel, isDark }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className={`p-8 rounded-md text-center shadow-lg w-[360px] transition-all duration-300 ${
        isDark ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-800'
      }`}>
        <div className="flex flex-col items-center">
          {/* Warning Icon */}
          <div className="text-6xl text-orange-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold italic mb-2">Confirmation</h2>

          {/* Message */}
          <p className="mb-6">
            Are you sure you want to log off?
          </p>

          {/* Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={onConfirm}
              className="bg-[#a68c65] text-white font-bold py-2 px-6 rounded hover:opacity-90"
            >
              Yes
            </button>
            <button
              onClick={onCancel}
              className={`border font-bold py-2 px-6 rounded hover:bg-opacity-10 ${
                isDark
                  ? 'border-[#a68c65] text-[#a68c65] hover:bg-white hover:text-[#a68c65]'
                  : 'border-[#a68c65] text-[#a68c65] hover:bg-gray-100'
              }`}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
