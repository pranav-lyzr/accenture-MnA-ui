import React from 'react';
import './LoadingPopup.css'; // Import the CSS file

interface LoadingPopupProps {
  message: string;
  isOpen: boolean;
}

const LoadingPopup: React.FC<LoadingPopupProps> = ({ message, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backdropFilter: 'blur(8px)', background: 'rgba(255, 255, 255, 0.2)' }}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center popup-container"
        style={{ minWidth: '300px', minHeight: '200px' }}
      >
        <div className="flex items-center justify-center">
          <div
            className="rounded-full h-12 w-12 border-4 border-purple-500 border-opacity-25 border-t-purple-500 spinner"
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mt-4">{message}</h3>
        <p className="text-gray-500 mt-2">Please wait...</p>
      </div>
    </div>
  );
};

export default LoadingPopup;