"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  selectMonth,
  selectYear,
  editBudget,
  editAccounts,
  selectTermMonth,
  selectTermYear,
} from "/public/src/feature/termSlice";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sendAlert } from "../Services/AlertServices";
import { FaRegEdit } from "react-icons/fa";
import BudgetPieChart from "../Visualisations/BudgetPieChart";
import UserDivisionPieChart from "../Visualisations/UserDivisionPieChart";

import BudgetAccountComparisonChart from "../Visualisations/BudgetAccountComparisonChart";
import { MdDeleteOutline } from "react-icons/md";

const SharedBudgetDashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const LastEditedMonth = useSelector(selectTermMonth)
    ? useSelector(selectTermMonth)
    : "August";
  const LastEditedYear = useSelector(selectTermYear)
    ? useSelector(selectTermYear)
    : 2024;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  console.log("baseUrl: " + baseUrl);

  const months = [
    { month: "July", year: 2024 },
    { month: "August", year: 2024 },
    { month: "September", year: 2024 },
    { month: "October", year: 2024 },
  ];

  const [showBudget, setShowBudget] = useState(false);
  const [budgetName, setBudgetName] = useState("");
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [month, setMonth] = useState(LastEditedMonth);
  const [year, setYear] = useState(LastEditedYear);
  const [budgets, setBudgets] = useState([]);
  const [refreshAccounts, setRefreshAccounts] = useState(false);
  const [refreshBudgets, setRefreshBudgets] = useState(false);

  const user = localStorage.getItem("userEmail");

  const aggregateUserCosts = (budgets) => {
    const userCosts = {};
  
    budgets.forEach((budget) => {
      budget.sharedUsers.forEach((user) => {
        if (userCosts[user.userEmail]) {
          userCosts[user.userEmail] += user.perPersonCost;
        } else {
          userCosts[user.userEmail] = user.perPersonCost;
        }
      });
    });
  
    return Object.keys(userCosts).map((userEmail) => ({
      userEmail,
      perPersonCost: userCosts[userEmail],
    }));
  };

  const aggregatedUserCosts = aggregateUserCosts(budgets);

  const handleTerm = (month, year) => {
    setMonth(month);
    setYear(year);
    dispatch(selectMonth(month));
    dispatch(selectYear(year));
    setRefreshBudgets(true);
    setRefreshAccounts(true);
  };

  const calculateTotalAmount = (budgetItems) => {
    return budgetItems.reduce((totalbud, itemb) => totalbud + itemb.amount, 0);
  };

  const calculateTotalBalance = (accounts) => {
    return accounts.reduce((total, item) => total + item.amount, 0);
  };

  const handleFetchBudgets = async () => {
    try {
      const budgetresponse = await axios.get(`${baseUrl}/get-shared-budgets`, {
        params: {
          user,
          month,
          year,
        },
      });
      console.log("Budgets fetched successfully:", budgetresponse.data);
      if (
        budgetresponse != undefined &&
        budgetresponse.data != undefined &&
        budgetresponse.data[0] != undefined
      ) {
        setShowBudget(true);
        dispatch(editBudget(true));
        const budgetItems = budgetresponse.data;
        setBudgetName(budgetresponse.data[0].budgetName);
        setBudgets(budgetItems);
        setTotalBudget(calculateTotalAmount(budgetItems));
      } else if (budgetresponse.data.length === 0) {
        console.log("Empty budget");
        setShowBudget(false);
        dispatch(editBudget(false));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleFetchAccounts = async () => {
    try {
      const response = await axios.get(`${baseUrl}/get-accounts`, {
        params: {
          user,
          month,
          year,
        },
      });
      console.log("Accounts fetched successfully:", response.data);
      if (
        response != undefined &&
        response.data != undefined &&
        response.data[0] != undefined
      ) {
        const accounts = response.data;
        dispatch(editAccounts(true));
        setTotalBalance(calculateTotalBalance(accounts));
        console.log("total", totalBalance);
      } else if (response.data.length === 0) {
        const accounts = response.data;
        setTotalBalance(calculateTotalBalance(accounts));
        dispatch(editAccount(false));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${baseUrl}/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user, month, year }),
      });

      if (response.ok) {
        console.log("Accounts deleted successfully:", response.data);
        dispatch(editAccounts(false));
        setTotalBalance(calculateTotalBalance([]));
        setRefreshAccounts(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteBudget = async () => {
    try {
      const response = await fetch(`${baseUrl}/delete-shared-budget`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user, month, year }),
      });

      if (response.ok) {
        console.log("Shared Budget deleted successfully:", response.data);
        setShowBudget(false);
        dispatch(editBudget(false));
        const budgetItems = [];
        setBudgets(budgetItems);
        sendAlert("Shared Budget deleted", "Failure");
        setTimeout(() => {
          setRefreshBudgets(true);
        }, 1000);
        setTotalBudget(calculateTotalAmount(budgetItems));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (month && year) {
      handleFetchBudgets();
      handleFetchAccounts();
    }
  }, [month, year, refreshAccounts, refreshBudgets, showBudget, totalBalance]);

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <div className="flex flex-col  bg-purple-200">
      <div className="bg-gray-400 flex items-center h-[10vh] pt-1">
        <div className="flex-1 flex justify-center">
          <select
            onChange={(e) => {
              const [selectedMonth, selectedYear] = e.target.value.split(" ");
              handleTerm(selectedMonth, selectedYear);
            }}
            className="w-180 bg-white border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg 
            shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 py-2 px-4 transition 
            duration-500 ease-in-out"
          >
            {months.map(({ month, year }) => (
              <option
                key={month}
                value={`${month} ${year}`}
                className="text-gray-900"
              >
                {month} {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col  pl-5 h-[85vh]">
        <div className="pl-4 mt-3 ">
          <div className="flex flex-row">
            <div className="pl-4 mr-20 w-[45%]">
              <h2 className="text-xl font-bold mb-4">Shared Budget</h2>
              <ToastContainer />
              {!showBudget ? (
                <div
                  className="flex items-center justify-between p-4 mb-4 bg-gray-100 rounded-lg shadow-md hover:shadow-lg 
            transition-shadow duration-100 cursor-pointer"
                  onClick={() => handleNavigation("/createSharedBudget")}
                >
                  <div>
                    <div className="text-lg font-bold">
                      Create New Shared Budget
                    </div>
                    <div className="pt-5 pb-5"></div>
                  </div>
                  <div className="flex">
                    <FaRegEdit
                      onClick={() => handleNavigation("/createSharedBudget")}
                      size={40}
                      className="flex-col cursor-pointer text-blue-500 hover:text-blue-700 pr-2"
                    />
                    <MdDeleteOutline
                      size={40}
                      className="flex-col cursor-pointer text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteBudget()}
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center justify-between p-4 mb-4 bg-gray-100 rounded-lg shadow-md hover:shadow-lg 
            transition-shadow duration-100 cursor-pointer"
                >
                  <div>
                    <div className="text-lg font-bold">{budgetName}</div>
                    <div className="pt-5">Budget Total: ${totalBudget}</div>
                  </div>
                  <div className="flex">
                    <FaRegEdit
                      onClick={() => handleNavigation("/createSharedBudget")}
                      size={40}
                      className="flex-col cursor-pointer text-blue-500 hover:text-blue-700 pr-2"
                    />
                    <MdDeleteOutline
                      size={40}
                      className="flex-col cursor-pointer text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteBudget()}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="pl-4 h-2/3 pt-3">
  <div className="flex flex-row justify-center">  {/* Added justify-center to align items in the center */}
    <div className="mx-auto w-[45%]">  {/* Adjusted for centering the pie chart */}
      {showBudget && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            Shared Budget Insights
          </h2>
          <BudgetPieChart data={budgets} />
        </div>
      )}
    </div>
    <div className="mx-auto w-[45%]">  {/* Adjusted for centering the pie chart */}
      {showBudget && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            User Division Insights
          </h2>
          <UserDivisionPieChart data={aggregatedUserCosts} />
        </div>
      )}
    </div>
  </div>
</div>

      </div>
    </div>
  );
};

export default SharedBudgetDashboard;
