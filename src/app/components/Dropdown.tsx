'use client';

import { useRef, useEffect } from 'react';

/**
 * Defines the props for the Dropdown component.
 */
interface DropdownProps {
  id: string; // Unique identifier for the dropdown
  label: string; // Text to be displayed on the dropdown button
  openDropdown: string | null; // The ID of the currently open dropdown, or null if none are open
  setOpenDropdown: (id: string | null) => void; // Function to update the state of the open dropdown
  children: React.ReactNode; // The content to be displayed within the dropdown panel
}

/**
 * A reusable Dropdown component that can be used to display content in a dropdown panel.
 * It handles its own open/close state and closes when a click is detected outside of it.
 */
export default function Dropdown({
  id,
  label,
  openDropdown,
  setOpenDropdown,
  children,
}: DropdownProps) {
  // Ref for the dropdown container to detect outside clicks
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Determines if the current dropdown instance is the one that should be open
  const isOpen = openDropdown === id;

  // Effect to handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the click is outside the dropdown, close it
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    // Add event listener when the component mounts
    document.addEventListener('mousedown', handleClickOutside);
    // Clean up the event listener when the component unmounts
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

