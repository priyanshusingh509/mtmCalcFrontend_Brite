'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const groupedHeaderFields = [
    {
        group: "Dashboard",
        items: [
            { name: "Main", href: "/dashboard" },
            { name: "NSE Algo", href: "nseAlgoDashboard" },
        ]
    },
    {
        group: "BSE",
        items: [
        { name: "BSE CM", href: "/bseCashMarket" },
        { name: "BSE FNO", href: "/bseEQD" },
        ],
    },
    {
        group: "NSE",
        items: [
        { name: "NSE CM", href: "/nseCashMarket" },
        {name: "NSE FNO", href: "/nseFnoAlgo"},
        ],
    },
    {
        group: "Summary",
        items: [
        { name: "Client Summary", href: "/clientSummary" },
        { name: "Symbol Summary", href: "/symbolSummary" },
        ],
    },
    {
        group: "Turnover",
        href: "/turnover"
    }
];

export default function Header() {
    const [showMenu, setShowMenu] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const desktopDropdownRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const hamburgerRef = useRef<HTMLImageElement>(null);

    const toggleDropdown = (group: string) => {
        setOpenDropdown((prev) => (prev === group ? null : group));
    };

    const handleMobileNavLinkClick = () => {
        setShowMenu(false);
        setOpenDropdown(null);
    };

    const router = useRouter();

    function handleLogout() {
        const refreshToken = document.cookie.split(";").find(row => row.startsWith('refreshToken='))?.split('=')[1];
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/user/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })
        })
        .then((res) => {
            if (res.status === 204) {
                console.log('✅ Logged out');
                router.push('/');
            } else {
                console.error('❌ Logout failed');
            }
        })
        .catch((err) => {
            console.error('❌ Logout error:', err);
        });
        sessionStorage.clear();
    }

    useEffect(() => {
        function handleClick(event: MouseEvent) {
            const target = event.target as Node;

            if (
                openDropdown &&
                desktopDropdownRef.current &&
                !desktopDropdownRef.current.contains(target)
            ) {
                setOpenDropdown(null);
            }

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

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [openDropdown, showMenu]);

    return (
        <div>
            <div className="bg-blue-600 text-white grid grid-cols-3 lg:grid-cols-6 justify-between items-center">
                <div className="lg:hidden">
                    <img
                        ref={hamburgerRef}
                        src={"/menu.png"}
                        className="w-6 mx-3 invert"
                        onClick={() => setShowMenu((prev) => !prev)}
                    />
                </div>
                <div className="flex justify-center items-center">
                    <Link href={"/dashboard"} className="flex gap-3 items-center font-bold text-2xl mx-8 my-2 justify-center lg:justify-start">
                        <img src={"./logo.png"} width={"36px"} />
                        <div>Algoquant</div>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="hidden lg:flex gap-10 my-2 col-span-4 justify-center text-lg relative">
                    {groupedHeaderFields.map((group, i) => (
                        <div key={i} className="relative">
                            {group.items ? (
                                <button onClick={() => toggleDropdown(group.group)}>
                                    {group.group}
                                </button>
                            ) : (
                                <Link href={group.href}>{group.group}</Link>
                            )}

                            {openDropdown === group.group && group.items && (
                                <div
                                    className="absolute flex flex-col bg-white text-black rounded-md shadow-2xl mt-2 z-5 min-w-[180px] text-sm justify-center items-center"
                                    ref={desktopDropdownRef}
                                >
                                    {group.items.map((item, idx) => (
                                        <div key={idx} className="flex flex-col justify-center items-center w-full h-full">
                                            {idx !== 0 && <div className="h-[1px] w-[calc(90%)] bg-black" />}
                                            <Link
                                                href={item.href}
                                                className="px-4 py-2 hover:text-blue-500 hover:font-bold"
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

                <div className="hidden lg:flex mx-8 justify-end font-medium">
                    <button
                        className="cursor-pointer border-2 bg-red-500 shadow-2xl px-2 rounded-md hover:bg-blue-600 hover:text-red-500 border-red-500"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                ref={mobileMenuRef}
                className={`${showMenu ? 'fixed z-5 w-2/3 flex flex-col justify-center items-center border-1 border-gray-500 rounded-2xl font-bold shadow-2xl bg-white p-2' : 'hidden'} m-2 justify-center text-lg`}
            >
                {groupedHeaderFields.map((group, i) => (
                    group.items ? (
                        <div key={i} className="relative w-full flex flex-col justify-center items-center">
                            <button
                                className="py-2 w-full text-center"
                                onClick={() => toggleDropdown(group.group)}
                            >
                                {group.group}
                            </button>

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
                                href={group.href}
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
                ))}

                <div className="py-1 text-red-500 font-bold" onClick={handleLogout}>
                    Logout
                </div>
            </div>
        </div>
    );
}
