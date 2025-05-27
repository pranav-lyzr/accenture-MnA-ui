import React, { useState, useEffect } from 'react';
// import './LoadingPopup.css'; // Import the CSS file
import { Loader2 } from "lucide-react";

interface LoadingPopupProps {
  message: string;
  isOpen: boolean;
}

const LoadingPopup: React.FC<LoadingPopupProps> = ({ message, isOpen }) => {
  const [dots, setDots] = useState(''); // State for animated dots

  // Effect for animating dots
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOpen) {
      // Cycle through dots: "", ".", "..", "..."
      interval = setInterval(() => {
        setDots((prev) => {
          if (prev === '') return '.';
          if (prev === '.') return '..';
          if (prev === '..') return '...';
          return '';
        });
      }, 500); // Update every 500ms
    }
    // Clean up interval when isOpen becomes false or component unmounts
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

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
          <Loader2 className="w-8 h-8 animate-spin text-purple-500"/>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mt-4">{message}</h3>
        <p className="text-gray-500 mt-2">Please wait{dots}</p>
      </div>
    </div>
  );
};

export default LoadingPopup;