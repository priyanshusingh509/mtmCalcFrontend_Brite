'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Defines the structure for navigation links, grouped by categories.
const groupedHeaderFields = [
  {
    group: 'Dashboard',
    href: '/dashboard',
  },
  // {
  //   group: 'Dashboard',
  //   items: [
  //     { name: 'Main', href: '/dashboard/main' },
  //   ],
  // },
  {
    group: 'NSE',
    items: [
      { name: 'NSE FNO', href: '/nse/fno' },
    ],
  },
];

export default function Header() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false); // For the mobile hamburger menu
  const [openDropdown, setOpenDropdown] = useState<string | null>(null); // For dropdowns in both menus

  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLImageElement>(null);

  const toggleDropdown = (group: string) => {
    setOpenDropdown((prev) => (prev === group ? null : group));
  };

  /**
   * Closes the mobile menu and any open dropdowns when a navigation link is clicked.
   */
  const handleMobileNavLinkClick = () => {
    setShowMenu(false);
    setOpenDropdown(null);
  };

  /**
   * Handles the user logout process.
   */
  const handleLogout = () => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/user/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (res.status === 204) {
          isAuthenticated.current = false;
          router.push('/');
        } else {
          console.error('❌ Logout failed');
        }
      })
      .catch((err) => {
        console.error('❌ Logout error:', err);
      });
    sessionStorage.clear();
  };

  // Effect to handle clicks outside of the menus to close them.
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;

      // Close desktop dropdown if click is outside
      if (openDropdown && desktopDropdownRef.current && !desktopDropdownRef.current.contains(target)) {
        setOpenDropdown(null);
      }

      // Close mobile menu if click is outside
      if (
        showMenu &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(target)
      ) {
        setShowMenu(false);
        setOpenDropdown(null);
      }
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [openDropdown, showMenu]);

  return (
    <div>
      {/* Main header bar */}
      <div className="bg-blue-600 text-white grid grid-cols-3 lg:grid-cols-6 justify-between items-center">
        {/* Mobile hamburger menu button */}
        <div className="lg:hidden">
          <img
            ref={hamburgerRef}
            src={'/menu.png'}
            alt="Menu"
            className="w-6 mx-3 invert cursor-pointer"
            onClick={() => setShowMenu((prev) => !prev)}
          />
        </div>

        {/* Logo and application title */}
        <div className="flex justify-center items-center">
          <Link href={'/dashboard'} className="flex gap-3 items-center font-bold text-2xl mx-8 my-2 justify-center lg:justify-start">
            {/* <img src={'/logo.png'} width={'36px'} alt="BriteOptions Logo" /> */}
            <h1>BriteOptions</h1>
          </Link>
        </div>

        {/* Desktop navigation menu */}
        <div className="hidden lg:flex lg:col-span-4 justify-center items-center">
          {groupedHeaderFields.map((group, i) => (
            <div key={i} className="relative mx-4" ref={desktopDropdownRef}>
              {group.items ? (
                <button className="cursor-pointer" onClick={() => toggleDropdown(group.group)}>
                  {group.group}
                </button>
              ) : (
                <Link href={group.href!}>{group.group}</Link>
              )}

              {/* Desktop dropdown content */}
              {openDropdown === group.group && group.items && (
                <div className="absolute mt-2 w-48 bg-white text-black rounded-md shadow-lg z-50">
                  {group.items.map((item, idx) => (
                    <div key={idx}>
                      <Link
                        href={item.href}
                        className="block px-4 py-2 hover:bg-gray-200"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {item.name}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Logout button for desktop view */}
        <div className="hidden lg:flex mx-8 justify-end font-medium">
          <button
            className="cursor-pointer border-2 bg-red-500 shadow-2xl px-2 rounded-md hover:bg-blue-600 hover:text-red-500 border-red-500"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile navigation menu (sidebar) */}
      <div
        ref={mobileMenuRef}
        className={`${showMenu ? 'fixed z-50 w-2/3 flex flex-col justify-center items-center border-1 border-gray-500 rounded-2xl font-bold shadow-2xl bg-white p-2' : 'hidden'} m-2 justify-center text-lg`}
      >
        {groupedHeaderFields.map((group, i) =>
          group.items ? (
            <div key={i} className="relative w-full flex flex-col justify-center items-center">
              <button className="py-2 w-full text-center" onClick={() => toggleDropdown(group.group)}>
                {group.group}
              </button>

              {/* Mobile dropdown content */}
              {openDropdown === group.group && (
                <div className="flex flex-col bg-white text-black rounded-md mt-2 min-w-[90%] w-[90%] z-50">
                  {group.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col justify-center items-center w-full">
                      {idx !== 0 && <div className="h-[1px] w-[90%] bg-gray-500" />}
                      <Link
                        href={item.href}
                        className="px-4 py-2 w-full text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMobileNavLinkClick();
                        }}
                      >
                        {item.name}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
              <div className="w-[90%] h-[1px] bg-black mt-2" />
            </div>
          ) : (
            <div key={i} className="relative w-full flex flex-col justify-center items-center">
              <Link
                href={group.href!}
                className="px-4 py-2 w-full text-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMobileNavLinkClick();
                }}
              >
                {group.group}
              </Link>
              <div className="w-[90%] h-[1px] bg-black mt-2" />
            </div>
          )
        )}

        {/* Logout button for mobile view */}
        <div className="py-1 text-red-500 font-bold cursor-pointer" onClick={handleLogout}>
          Logout
        </div>
      </div>
    </div>
  );
}
