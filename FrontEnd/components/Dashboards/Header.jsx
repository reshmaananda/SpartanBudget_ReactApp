"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import appLogo from "/public/newLogo.svg";
import { useSession, signOut } from "next-auth/react";
import { FcReadingEbook } from "react-icons/fc";
import { IoIosArrowDown } from "react-icons/io";
import { useRouter } from "next/navigation";
import { auth } from "../../components/firebase";

const Header = () => {
  const [showLogout, setShowLogout] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  const loggedInUserName = localStorage.getItem("userName");

  const handleLogout = async () => {
    console.log("here...");
    if (localStorage.getItem("authMethod") === "firebase") {
      await auth.signOut();
    } else {
      await signOut({ redirect: false });
    }
    localStorage.removeItem("authMethod");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    router.push("/");
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowLogout(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-purple-200 flex items-center p-2 shadow-md top-0 sticky z-50">
      <div className="pl-20">
        <Image src={appLogo} alt="App Logo" width={300} height={100} />
      </div>

      <div
        className="flex ml-auto items-center mr-20 pr-10 py-3 pl-4 cursor-pointer relative"
        onClick={() => setShowLogout(!showLogout)}
        ref={dropdownRef}
      >
        <FcReadingEbook size={40} />
        <p className="hidden sm:inline-flex font-medium">{loggedInUserName}</p>
        <IoIosArrowDown className="ml-2" size={20} />
        {showLogout && (
          <div className="absolute top-full right-0 mt-2 bg-purple-100 shadow-lg rounded-md px-7 py-3">
            <button
              onClick={handleLogout}
              className="text-black-500 hover:text-red-500 w-full text-left"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
