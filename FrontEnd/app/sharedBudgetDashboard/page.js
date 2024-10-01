import SharedBudgetDashboard from "/components/Dashboards/SharedBudgetDashboard";
import Header from "/components/Dashboards/Header";
import Sidepanel from "/components/Dashboards/Sidepanel";
import Head from "next/head";
  
  export default async function sharedBudgetDashboardPage({}) {
    return (
      <div className="w-screen h-screen">
      <Head>
        <title>Spartan Budget</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header className="h-[4vh]"/>
      <main className="flex flex-row h-[96vh] bg-gray-100">
        <div className="w-[18%]">
        {/* Left Side Panel */}
        <Sidepanel/>

        </div>
        <div className="w-[82%] h-[90%]">
       {/* Main Page */}
       <SharedBudgetDashboard/>
        </div>
      </main>
      </div>
    );
  }