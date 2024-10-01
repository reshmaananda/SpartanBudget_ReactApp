"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "../../components/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import appLogo from "/public/newLogo.svg";
import { FacebookSignInButton, GoogleSignInButton } from "./Authentications";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  function getEmailPrefix(email) {
    return email.split("@")[0];
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      if (user.emailVerified) {
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userName", getEmailPrefix(user.email));
        localStorage.setItem("authMethod", "firebase");
        router.push("/budgetDashboard");
      } else {
        setError("Please verify your email before logging in.");
        auth.signOut(); // Sign out the user if email is not verified
      }
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
        <form onSubmit={handleLogin}>
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

          {error && <p className="text-red-500">{error}</p>}

          <button
            className="w-full mb-4 text-[18px] mt-6 rounded-full bg-white text-blue-900
              hover:bg-blue-900 hover:text-white py-2"
            type="submit"
          >
            Login
          </button>
          <div>
            <span className="text-white items-center">
              Don't have an account?{" "}
              <Link className="ml-2 text-blue-800 underline" href="/signup">
                Signup!
              </Link>
            </span>
          </div>
        </form>
        <div>
          <GoogleSignInButton className="items-center" />
          <FacebookSignInButton className="items-center" />
        </div>
      </div>
    </div>
  );
};

export default Login;
