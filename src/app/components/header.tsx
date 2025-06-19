import Link from "next/link";
import { useRouter } from "next/navigation";

const headerFields = [
    {
        name: "Option 1",
        href: "/option1"
    },
    {
        name: "Option 2",
        href: "/option2"
    },
    {
        name: "Option 3",
        href: "/option3"
    },
    {
        name: "Option 4",
        href: "/option4"
    },
    {
        name: "Option 5",
        href: "/option5"
    },
]



export default function Header(){
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
        localStorage.removeItem('username');
    }
    return <div className="bg-blue-600 text-white grid grid-cols-6 justify-between items-center">
        <div className="grid- flex gap-3 items-center font-bold text-2xl mx-8 my-6 justify-start">
            <img src={"./logo.png"} width={"36px"}/>
            Algoquant
        </div>
        <div className="flex gap-10 my-6 col-span-4 justify-center text-lg">
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