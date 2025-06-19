'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";



export default function TradePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({username: "", password: ""})
const handleSubmit = async () => {;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // for cookie support
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      alert("Invalid Credentials");
      return;
    }

    // Redirect if successful
    router.push("/bseCashMarket");

  } catch (error) {
    alert("Internal Server Error");
  }
};

  const handleChange = (e: any) =>{
    setFormData({...formData, [e.target.name]: e.target.value})
  }
  return (
    <div className="bg-blue-600 h-[100vh] text-white flex justify-evenly items-center">
     <div className="text-8xl font-bold flex flex-col items-center justify-center gap-5"><img src={"./logo.png"} width={"200px"}/> Algoquant</div>
     <div className="w-1 h-90 bg-white rounded-2xl"></div>
     <div className="bg-gray-50 w-100 h-120 rounded-3xl shadow-2xl text-black flex flex-col items-center">
       <form className="w-full h-full flex flex-col justify-evenly " 
        onSubmit={(e)=>{
          e.preventDefault();
          handleSubmit();
          }
        }
        onChange={handleChange}>
        <div className="flex justify-center text-4xl font-semibold m-4 ">Login</div>
        <div className=" flex flex-col justify-center">
          <div className="flex justify-center">
            <input name="username" placeholder="Username" className="border-1 rounded-md m-2 p-2 w-[calc(50%)]"/>
          </div>
          <div className="flex justify-center">
          <input name="password" placeholder="Password" type="password" className="border-1 rounded-md m-2 p-2 w-[calc(50%)]"/>
        </div>
        </div>
        <div className="flex justify-center items-center">
          <button className="bg-blue-600 rounded-md text-white text-2xl p-2 w-[calc(40%)] border-2 border-blue-600 hover:bg-white hover:text-blue-600 cursor-pointer transition delay-50" >
            Submit
          </button>
        </div>
       </form>
      </div>
    </div>


  );
}
