import React from "react";

interface UserIconProps {
  role: string;
  className?: string;
}

const UserIcon = ({ role, className = '' }: UserIconProps) => {
  const isUser = role === "user";
  
  return (
    <div className={`relative w-[35px] h-[35px] rounded-full flex-shrink-0 overflow-hidden ${className}`}>
      {isUser ? (
        <div className="flex items-center justify-center w-full h-full bg-blue-500 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-700 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
      )}
    </div>
  );
};

export default UserIcon;