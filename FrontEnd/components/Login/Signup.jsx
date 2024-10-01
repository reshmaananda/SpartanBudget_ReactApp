"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "../../components/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import appLogo from "/public/newLogo.svg";

const Signup = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // Added for displaying success message

  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Sign out the user immediately after creating the account to prevent auto-login
      await auth.signOut();

      // Set message and remain on the signup page
      setMessage("Verification email sent. Please check your inbox.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="text-black font-bold">
      <div
        className="bg-slate-600 border border-slate-400 rounded-md p-8 shadow-lg backdrop-filter 
        background-blur-sm bg-opacity-60 relative"
      >
        <span className="items-center">
          <Image src={appLogo} alt="App Logo" width={300} height={100} />
        </span>
        <form onSubmit={handleSignup}>
          <div className="relative pt-2 pb-4">
            <input
              type="email"
              className="mt-2 block w-72 py-2.3 px-0 bg-transparent border-0 border-b-2 border-gray-300 apperance-none 
                dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus-text-white focus-border-blue-600 peer"
              placeholder=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label
              htmlFor="email"
              className="absolute text-sm px-0 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] 
                peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 
                peer-placeholder-shown:-translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Email
            </label>
          </div>
          <div className="relative pt-2 pb-4">
            <input
              type="password"
              className="mt-2 block w-72 py-2.3 px-0 text-sm bg-transparent border-0 border-b-2 border-gray-300 apperance-none 
                dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus-text-white focus-border-blue-600 peer"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label
              htmlFor="password"
              className="absolute text-sm duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Password
            </label>
          </div>
          <div className="relative pt-2">
            <input
              type="password"
              className="mt-2 block w-72 py-2.3 px-0 text-sm bg-transparent border-0 border-b-2 border-gray-300 apperance-none 
                dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus-text-white focus-border-blue-600 peer"
              placeholder=""
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label
              htmlFor="confirmPassword"
              className="absolute text-sm duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Confirm Password
            </label>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-500">{message}</p>}{" "}
          {/* Success message */}
          <button
            className="w-full mb-4 text-[18px] mt-6 rounded-full bg-white text-blue-900
              hover:bg-blue-900 hover:text-white py-2"
            type="submit"
          >
            Signup
          </button>
          <div>
            <span className="text-white items-center">
              Have an account?{" "}
              <Link className="ml-2 text-blue-800 underline" href="/">
                Login!
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
