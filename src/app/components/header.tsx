import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const headerFields = [
    {
        name: "BSE EQ",
        href: "/bseCashMarket"
    },
    {
        name: "BSE EQD",
        href: "/bseEQD"
    },
    {
        name: "NSE CM",
        href: "/nseCashMarket"
    },
    {
        name: "Client Summary",
        href: "/clientSummary"
    },
    {
        name: "Symbol Summary",
        href: "/symbolSummary"
    }
]



export default function Header(){
    // const { pageIndex } = useTradeData();
    const [showMenu, setShowMenu] = useState(false);
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
    return <div className="bg-blue-600 text-white grid grid-cols-2 lg:grid-cols-6 justify-between items-center">
        <div className="flex justify-center items-center">
            <div className="lg:hidden" onClick={()=> setShowMenu(!showMenu)}>
                HMB
            </div>
            <div className="grid- flex gap-3 items-center font-bold text-2xl mx-8 my-6 justify-start">
                <img src={"./logo.png"} width={"36px"}/>
                <div className="hidden lg:block">
                    Algoquant
                </div>
            </div>

        </div>
        
        <div className="hidden lg:flex gap-10 my-6 col-span-4 justify-center text-lg">
           {headerFields.map((field, index) =>{
            return <Link key={index} href={field.href}>{field.name}</Link>
           })}
        </div>
        <div className={`${showMenu ? 'flex flex-col' : 'hidden'} gap-10 my-6 col-span-4 justify-center text-lg`}>
           {headerFields.map((field, index) =>{
            return <Link key={index} href={field.href}>{field.name}</Link>
           })}
        </div>
        <div className="flex mx-8 justify-end font-semibold">
           <button className="cursor-pointer border-2 bg-red-500 shadow-2xl px-6 py-2 rounded-2xl hover:bg-blue-600 hover:text-red-500 border-red-500" onClick={handleLogout} >
            Logout
           </button>
        </div>
    </div>
}