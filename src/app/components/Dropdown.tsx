'use client';

import { useRef, useEffect } from 'react';

interface DropdownProps {
  id: string;
  label: string;
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  children: React.ReactNode;
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setOpenDropdown]);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        onClick={() => setOpenDropdown(isOpen ? null : id)}
        className="flex justify-center items-center mx-1 px-4 py-2 w-[30vw] md:w-[20vw] lg:w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition transform duration-100"
      >
        {label}
      </button>

      {isOpen && (
        <div className="absolute z-50 bg-white border-1 rounded-md">
          {children}
        </div>
      )}

    </div>
  );
}
