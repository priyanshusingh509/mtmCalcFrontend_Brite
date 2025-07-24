'use client';

// React and Next.js imports
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Custom authentication context
import { useAuth } from "./context/AuthContext";

/**
 * TradePage component serves as the main entry point for user authentication.
 * It provides both login and signup forms.
 */
export default function TradePage() {
  // useAuth hook to access authentication state
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // State to manage form data for name, username, and password
  const [formData, setFormData] = useState({ name: "", username: "", password: "" });
  // State to toggle between login and signup forms
  const [isSignup, setIsSignup] = useState(false);

  // Effect to redirect authenticated users to the dashboard
  useEffect(() => {
    if (isAuthenticated.current) {
      router.push('/dashboard/main');
    }
  }, [isAuthenticated.current]);

  /**
   * Handles form submission for both login and signup.
   */
  const handleSubmit = async () => {
    try {
      // Determine the API endpoint based on whether it's a signup or login action
      const endpoint = isSignup ? '/user/createuser' : '/user/login';
      // Prepare the payload with the appropriate user data
      const payload = isSignup
        ? { username: formData.username, name: formData.name, password: formData.password }
        : { username: formData.username, password: formData.password };

      // Send the request to the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        if (isSignup) {
          // If signup is successful, switch to the login form
          setIsSignup(false);
        } else {
          // If login is successful, set authentication state and redirect to the dashboard
          isAuthenticated.current = true;
          router.push('/dashboard/main');
        }
        // Clear the form data after a successful action
        setFormData({ name: "", username: "", password: "" });
      } else {
        // Handle errors from the server
        const err = await response.json();
        alert(err.error || "Invalid Credentials");
      }
    } catch (error) {
      // Handle network or other unexpected errors
      alert(`Internal Server Error ${error}`);
    }
  };

  return (
    <div className="bg-blue-600 h-[100vh] text-white flex flex-col lg:flex-row justify-evenly items-center">
      {/* Logo and application title */}
      <div className="text-4xl lg:text-8xl font-bold flex flex-col items-center justify-center gap-5">
        <img src="/logo.png" className="w-[120px] lg:w-[200px]" alt="Algoquant Logo" /> Algoquant
      </div>

      {/* Vertical separator for larger screens */}
      <div className="hidden lg:block w-1 h-90 bg-white rounded-2xl"></div>

      {/* Login/Signup form container */}
      <div className="bg-gray-50 w-[calc(90%)] lg:w-100 h-120 rounded-3xl shadow-2xl text-black flex flex-col items-center">
        <form
          className="w-full h-full flex flex-col justify-evenly"
          onSubmit={(e) => {
            e.preventDefault(); // Prevent default form submission
            handleSubmit();
          }}
        >
          <div className="flex justify-center text-4xl font-semibold m-4">
            {isSignup ? 'Sign Up' : 'Login'}
          </div>

          {/* Form input fields */}
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

          {/* Submit button */}
          <div className="flex justify-center items-center">
            <button
              type="submit"
              className="bg-blue-600 rounded-md text-white text-2xl p-2 w-[calc(40%)] border-2 border-blue-600 hover:bg-white hover:text-blue-600 cursor-pointer transition delay-50"
            >
              Submit
            </button>
          </div>

          {/* Toggle between Login and Signup */}
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
