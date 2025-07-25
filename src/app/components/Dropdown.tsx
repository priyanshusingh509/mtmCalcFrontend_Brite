'use client';

import { useRef, useEffect } from 'react';


interface DropdownProps {
  id: string; // Unique identifier for the dropdown
  label: string; // Text to be displayed on the dropdown button
  openDropdown: string | null; // The ID of the currently open dropdown, or null if none are open
  setOpenDropdown: (id: string | null) => void; // Function to update the state of the open dropdown
  children: React.ReactNode; // The content to be displayed within the dropdown panel
}

export default function Dropdown({
  id,
  label,
  openDropdown,
  setOpenDropdown,
  children,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpen = openDropdown === id;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setOpenDropdown]);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Button to toggle the dropdown's visibility */}
      <button
        onClick={() => setOpenDropdown(isOpen ? null : id)}
        className="flex justify-center items-center mx-1 px-4 py-2 w-[30vw] md:w-[20vw] lg:w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition transform duration-100"
      >
        {label}
      </button>

      {/* Conditionally render the dropdown content if it is open */}
      {isOpen && (
        <div className="absolute z-50 bg-white border-1 rounded-md">
          {children}
        </div>
      )}
    </div>
  );
}

