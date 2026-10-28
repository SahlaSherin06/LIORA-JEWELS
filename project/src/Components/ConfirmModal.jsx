import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = true }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-[#F5F0E1] rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-6 border-b ${isDanger ? 'border-red-200 bg-red-50' : 'border-[#7B4B3A] bg-[#EDE4D3]'}`}>
          <div className="flex items-center gap-3">
            {isDanger && <FaExclamationTriangle className="text-red-500 text-xl" />}
            <h2 className={`text-xl font-bold ${isDanger ? 'text-red-700' : 'text-[#7B4B3A]'}`}>
              {title}
            </h2>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-[#5C362C] text-lg">
            {message}
          </p>
        </div>
        
        <div className="flex gap-4 justify-end p-6 border-t border-gray-200 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2 font-medium text-white rounded-lg transition-colors duration-200 shadow-sm ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-100' 
                : 'bg-[#7B4B3A] hover:bg-[#5C362C] focus:ring-4 focus:ring-[#7B4B3A]/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
