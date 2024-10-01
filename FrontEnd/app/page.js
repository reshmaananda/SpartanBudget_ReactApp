import Login from "../components/Login/Login";
import Sidepanel from "../components/Dashboards/Sidepanel";
import BudgetDashboard from "../components/Dashboards/BudgetDashboard";
import { getServerSession } from "next-auth";
import Header from "../components/Dashboards/Header";
import Head from "next/head";

export default async function Home({}) {
  const session = await getServerSession();
    if(!session) return (
    <div className="text-white h-screen flex justify-center items-center bg-cover"
      style={{"backgroundImage":"url('./login2.jpg"}}>
        <Login/>
      </div>
      );
    return (
      <div className="w-screen h-screen">
      <Head>
        <title>Spartan Budget</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header className="h-[4vh]"/>
      <main className="flex flex-row h-[96vh] bg-gray-100">
        <div className="w-[18vw]">
        {/* Left Side Panel */}
        <Sidepanel/>

        </div>
        <div className="w-[82vw] h-[90vh]">
       {/* Main Page */}
       <BudgetDashboard/>
        </div>
      </main>
      </div>
    );
}
