import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const groupedHeaderFields = [
    {
        group: "Dashboard",
        href: "/dashboard"
    },

  {
    group: "BSE",
    items: [
      { name: "BSE EQ", href: "/bseCashMarket" },
      { name: "BSE EQD", href: "/bseEQD" },
    ],
  },
  {
    group: "NSE",
    items: [
      { name: "NSE CM", href: "/nseCashMarket" },
      {name: "NSE FNO", href: "/nseFno"},
    ],
  },
  {
    group: "Summary",
    items: [
      { name: "Client Summary", href: "/clientSummary" },
      { name: "Symbol Summary", href: "/symbolSummary" },
    ],
  },
];




export default function Header(){
    
    // const { pageIndex } = useTradeData();
    const [showMenu, setShowMenu] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const toggleDropdown = (group: string) => {
    setOpenDropdown((prev) => (prev === group ? null : group));
    };
    const router = useRouter();
    function handleLogout(){
        const refrestToken = document.cookie.split(";").find(row => row.startsWith('refreshToken='))?.split('=')[1]; 
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/user/logout`, {
            method: 'POST',
            credentials: 'include', // include cookies like refreshToken
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refrestToken })
        })
        .then((res) => {
            if (res.status === 204) {
                console.log('✅ Logged out');
                router.push('/'); // Navigate to home page or login
            } else {
                console.error('❌ Logout failed');
            }
        })
        .catch((err) => {
            console.error('❌ Logout error:', err);
        });
        localStorage.clear()
        // pageIndex.current = 0;
    }

    useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    // return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);
    return (
    <div className="bg-blue-600 text-white grid grid-cols-2 lg:grid-cols-6 justify-between items-center">
        <div className="flex justify-center items-center">
            <div className="lg:hidden" onClick={()=> setShowMenu(!showMenu)}>
                HMB
            </div>
            <Link href={"/dashboard"} className="grid- flex gap-3 items-center font-bold text-2xl mx-8 my-6 justify-start">
                <img src={"./logo.png"} width={"36px"}/>
                <div className="hidden lg:block">
                    Algoquant
                </div>
            </Link>

        </div>
        
              <div className="hidden lg:flex gap-10 my-6 col-span-4 justify-center text-lg relative">
        {groupedHeaderFields.map((group, i) => (
          <div key={i} className="relative">
            {group.items ? 
                <button
                    className=""
                    onClick={() =>  toggleDropdown(group.group)}
                >
                    {group.group}
                </button> : 
                <Link href={group.href}>{group.group}</Link>
            }
            

            {openDropdown === group.group && (
              <div className="absolute flex flex-col bg-white text-black rounded-md shadow-2xl mt-2 z-50 min-w-[180px] text-sm justify-center items-center" ref={dropdownRef}>
                {group.items ? group.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col justify-center items-center w-full h-full">
                    {idx != 0 ? <div className="h-[1px] w-[calc(90%)] bg-black"/> : null}
                    <Link
                        href={item.href}
                        className="px-4 py-2 hover:text-blue-500 hover:font-bold"
                        onClick={(e) => setOpenDropdown(null)}
                    >
                        {item.name}
                    </Link>
                    
                    </div>
                )) : null}
              </div>
            )}
          </div>
        ))}
      </div>

        <div className={`${showMenu ? 'flex flex-col' : 'hidden'} gap-10 my-6 col-span-4 justify-center text-lg`}>
           {groupedHeaderFields.map((group, i) => (
            <div key={i} className="relative group">
            <button className="font-semibold">{group.group}</button>
            <div className="absolute hidden group-hover:flex group-hover:flex-col bg-white text-black rounded-md shadow-lg mt-2 z-50 min-w-[180px]">
                {group.items ? group.items.map((item, idx) => (
                <Link
                    key={idx}
                    href={item.href}
                    className="px-4 py-2 hover:bg-blue-100"
                >
                    {item.name}
                </Link>
                )):null}
            </div>
            </div>
            ))}
        </div>
        <div className="flex mx-8 justify-end font-semibold">
           <button className="cursor-pointer border-2 bg-red-500 shadow-2xl px-6 py-2 rounded-2xl hover:bg-blue-600 hover:text-red-500 border-red-500" onClick={handleLogout} >
            Logout
           </button>
        </div>
    </div>)
}