"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function GoogleSignInButton() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = async () => {
    const result = await signIn("google", { redirect: false });
    if (result?.ok) {
      console.log("localStorage");
      localStorage.setItem("userEmail", session.user.email);
      localStorage.setItem("userName", getEmailPrefix(session.user.email));
      localStorage.setItem("authMethod", "oAuth");
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center font-semibold justify-center h-11 px-6 mt-4 text-l  transition-colors duration-300
       bg-white border-2 border-black text-black rounded-lg focus:shadow-outline hover:bg-slate-200"
    >
      <Image src="/google.png " alt="Google Logo" width={15} height={15} />
      <span className="ml-4 items-center">Continue with Google</span>
    </button>
  );
}

export function FacebookSignInButton() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = async () => {
    const result = await signIn("facebook", { redirect: false });

    if (result?.ok) {
      localStorage.setItem("userEmail", session.user.email);
      localStorage.setItem("userName", getEmailPrefix(session.user.email));
      localStorage.setItem("authMethod", "oAuth");
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center font-semibold justify-center h-11 px-6 mt-4 text-l  transition-colors duration-300
       bg-white border-2 border-black text-black rounded-lg focus:shadow-outline hover:bg-slate-200"
    >
      <Image src="/facebook.png" alt="Facebook Logo" width={15} height={15} />
      <span className="ml-4 items-center">Continue with Facebook</span>
    </button>
  );
}

export function CredentialsSignInButton() {
  const handleClick = () => {
    signIn();
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center font-semibold justify-center h-14 px-6 mt-4 text-xl transition-colors duration-300 bg-white border-2 border-black text-black rounded-lg focus:shadow-outline hover:bg-slate-200"
    >
      {/* <Image src={githubLogo} alt="Github Logo" width={20} height={20} /> */}
      <span className="ml-4">Continue with Email</span>
    </button>
  );
}
