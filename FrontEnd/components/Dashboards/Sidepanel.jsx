"use client";
import React, { useRef, useEffect } from "react";
import Image from "next/image";
import SidepanelItem from "./SidepanelItem";

import { FcMoneyTransfer } from "react-icons/fc";
import { FcConferenceCall } from "react-icons/fc";
import { FcPositiveDynamic } from "react-icons/fc";
import { FaDivide } from "react-icons/fa";

const SidePanel = () => {
  const sidePanelRef = useRef(null);

  useEffect(() => {
    if (sidePanelRef.current) {
      sidePanelRef.current.focus();
    }
  }, []);

  return (
    <div className="pt-2 ">
      <SidepanelItem
        className="bg-purple-200"
        Icon={FcMoneyTransfer}
        value="Smart Budget"
        page="/budgetDashboard"
      />
      <SidepanelItem
        Icon={FcConferenceCall}
        value="Shared Budget"
        page="/sharedBudgetDashboard"
      />
      <SidepanelItem
        Icon={FcPositiveDynamic}
        value="Financial Goals"
        page="/financialGoalDashboard"
      />
    </div>
  );
};

export default SidePanel;
