'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";

export default function TradePage() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", username: "", password: "" });
  const [isSignup, setIsSignup] = useState(false);

  // Redirect if already logged in
useEffect(() => {
  const verifyToken =  async () => {
    try{
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/user/verify-token`,{credentials: 'include', method: 'POST'});
      console.log(res);
      if(res.ok){
        setIsAuthenticated(true);
        router.push('/dashboard');
      } else{
        setIsAuthenticated(false);
      }
    } catch(err){
      console.error('session check failed', err);
      setIsAuthenticated(false);
    }
  }
  verifyToken();
}, []);


  const handleSubmit = async () => {
    try {
      const endpoint = isSignup ? '/user/createuser' : '/user/login';
      const payload = isSignup
        ? { username: formData.username, name: formData.name, password: formData.password }
        : { username: formData.username, password: formData.password };
      console.log("PAYLOAD IS THIS : ",payload);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        if (isSignup) {
          setIsSignup(false);
        } else {
          setIsAuthenticated(true);
          router.push('/dashboard');
        }

        setFormData({ name: "", username: "", password: "" });
      } else {
        const err = await response.json();
        alert(err.error || "Invalid Credentials");
      }
    } catch (error) {
      alert(`Internal Server Error ${error}`);
      console.log(error);
    }
  };

  // Optionally prevent render while redirecting
  if (isAuthenticated) return null;

  return (
    <div className="bg-blue-600 h-[100vh] text-white flex flex-col lg:flex-row justify-evenly items-center">
      <div className="text-4xl lg:text-8xl font-bold flex flex-col items-center justify-center gap-5">
        <img src="./logo.png" className="w-[120px] lg:w-[200px]" /> Algoquant
      </div>

      <div className="hidden lg:block w-1 h-90 bg-white rounded-2xl"></div>

      <div className="bg-gray-50 w-[calc(90%)] lg:w-100 h-120 rounded-3xl shadow-2xl text-black flex flex-col items-center">
        <form
          className="w-full h-full flex flex-col justify-evenly"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="flex justify-center text-4xl font-semibold m-4">
            {isSignup ? 'Sign Up' : 'Login'}
          </div>

          <div className="flex flex-col justify-center">
            {isSignup && (
              <div className="flex justify-center">
                <input
                  name="name"
                  placeholder="Full Name"
                  className="border-1 rounded-md m-2 p-2 w-[calc(50%)]"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            )}
            <div className="flex justify-center">
              <input
                name="username"
                placeholder="Username"
                className="border-1 rounded-md m-2 p-2 w-[calc(50%)]"
                required
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="flex justify-center">
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="border-1 rounded-md m-2 p-2 w-[calc(50%)]"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-center items-center">
            <button
              className="bg-blue-600 rounded-md text-white text-2xl p-2 w-[calc(40%)] border-2 border-blue-600 hover:bg-white hover:text-blue-600 cursor-pointer transition delay-50"
            >
              Submit
            </button>
          </div>

          <div className="text-center mt-2">
            {isSignup ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(false);
                    setFormData({ name: "", username: "", password: "" });
                  }}
                  className="text-blue-600 underline"
                >
                  Login
                </button>
              </span>
            ) : (
              <span>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(true);
                    setFormData({ name: "", username: "", password: "" });
                  }}
                  className="text-blue-600 underline"
                >
                  Sign up
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
