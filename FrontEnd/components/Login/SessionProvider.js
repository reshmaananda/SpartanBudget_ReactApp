"use client";
import { SessionProvider } from "next-auth/react";

const CustomSessionProvider = ({ children, session }) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

export default CustomSessionProvider;
