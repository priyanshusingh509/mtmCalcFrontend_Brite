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
    return (
        <div>
            <div className="bg-blue-600 text-white grid grid-cols-3 justify-between items-center lg:grid lg:grid-cols-6 ">
                <div className="lg:hidden">
                    <img src={"/menu.png"} className="w-6 mx-3 invert" onClick={()=> setShowMenu(!showMenu)}/>
                </div>
                <div className="flex justify-center items-center">
                    <Link href={"/dashboard"} className="flex gap-3 items-center font-bold text-2xl lg:mx-8 my-6 justify-start">
                        <img src={"./logo.png"} width={"36px"} className="hidden lg:block"/>
                        <div className="">
                            Algoquant
                        </div>
                    </Link>
                </div>
                <div className="hidden lg:flex gap-10 my-6 col-span-4 justify-center text-lg">
                {headerFields.map((field, index) =>{
                    return <Link key={index} href={field.href}>{field.name}</Link>
                })}
                </div>
                <div className=" hidden lg:flex mx-8 justify-end font-semibold">
                <button className="cursor-pointer border-2 bg-red-500 shadow-2xl px-6 py-2 rounded-2xl hover:bg-blue-600 hover:text-red-500 border-red-500" onClick={handleLogout} >
                    Logout
                </button>
                </div>
            </div>
            <div className={showMenu ? 'fixed z-10 w-2/3 flex flex-col justify-center items-center border-1 border-gray-500 rounded-2xl font-bold shadow-2xl bg-gray-100 p-2' : 'hidden'}>
                {headerFields.map((field, index) =>{
                return (
                    <div key={index}  className="w-full flex flex-col items-center justify-center">
                        <Link href={field.href} className="py-2 shadow-2xl">{field.name}</Link>
                        <div className="w-[calc(90%)] h-[1px] bg-gray-500"></div>
                    </div>
                )
                })}
                <div className="py-2 text-red-500 font-bold" onClick={handleLogout}>
                Logout
                </div>
            </div>
        </div>
    )
}