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
import { FaRegEdit } from "react-icons/fa";
import BudgetPieChart from "../Visualisations/BudgetPieChart";
import BudgetAccountComparisonChart from "../Visualisations/BudgetAccountComparisonChart";
import { MdDeleteOutline } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sendAlert } from "../Services/AlertServices";

const BudgetDashboard = () => {
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

  const getMonthsRange = () => {
    const months = [];
    const now = new Date();

    // Set the current month and year
    const currentYear = now.getFullYear();
    let currentMonth = now.getMonth(); // 0-based index (0 = January, 11 = December)

    // Helper function to get the month name
    const getMonthName = (monthIndex) => {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return monthNames[monthIndex];
    };

    // Calculate the range of months
    for (let i = -5; i <= 5; i++) {
      const monthIndex = (currentMonth + i + 12) % 12;
      const yearAdjustment = Math.floor((currentMonth + i) / 12);
      const year = currentYear + yearAdjustment;

      months.push({
        month: getMonthName(monthIndex),
        year: year,
      });
    }

    return months;
  };

  const months = getMonthsRange();

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
      const budgetresponse = await axios.get(`${baseUrl}/get-budgets`, {
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
      const response = await fetch(`${baseUrl}/delete-budget`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user, month, year }),
      });

      if (response.ok) {
        console.log("Budget deleted successfully:", response.data);
        setShowBudget(false);
        dispatch(editBudget(false));
        const budgetItems = [];
        setBudgets(budgetItems);
        sendAlert("Budgets successfully deleted", "Success");
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
            value={`${month} ${year}`} // Set the select value to current month and year
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
              <h2 className="text-xl font-bold mb-4">Smart Budget</h2>
              <ToastContainer />
              {!showBudget ? (
                <div
                  className="flex items-center justify-between p-4 mb-4 bg-gray-100 rounded-lg shadow-md hover:shadow-lg 
            transition-shadow duration-100 cursor-pointer"
                  onClick={() => handleNavigation("/createBudget")}
                >
                  <div>
                    <div className="text-lg font-bold">Create New Budget</div>
                    <div className="pt-5 pb-5"></div>
                  </div>
                  <div className="flex">
                    <FaRegEdit
                      onClick={() => handleNavigation("/createBudget")}
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
                      onClick={() => handleNavigation("/createBudget")}
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
            <div className="w-[45%]">
              <h2 className="text-xl font-bold mb-4">Accounts</h2>
              <div
                className="flex items-center justify-between p-4 mb-4 bg-gray-100 rounded-lg shadow-md hover:shadow-lg 
            transition-shadow duration-100 cursor-pointer"
              >
                <div>
                  <div className="text-lg font-bold">Add New Account</div>
                  {totalBalance > 0 ? (
                    <div className="pt-5">Total Balances: ${totalBalance}</div>
                  ) : (
                    <div className="pt-5">Total Balances: ${totalBalance}</div>
                  )}
                </div>
                {totalBalance > 0 ? (
                  <div className="flex">
                    <FaRegEdit
                      onClick={() => handleNavigation("/addAccount")}
                      size={40}
                      className="flex-col cursor-pointer text-blue-500 hover:text-blue-700 pr-2"
                    />
                    <MdDeleteOutline
                      size={40}
                      className="flex-col cursor-pointer text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteAccount()}
                    />
                  </div>
                ) : (
                  <div className="flex">
                    <FaRegEdit
                      onClick={() => handleNavigation("/addAccount")}
                      size={40}
                      className="flex-col cursor-pointer text-blue-500 hover:text-blue-700 pr-2"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="pl-4 h-2/3 pt-3">
          <div className="flex flex-row">
            <div className="pl-4 mr-20 w-[45%]">
              {showBudget && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Budget Insights</h2>
                  <BudgetPieChart data={budgets} />
                </div>
              )}
            </div>
            <div className=" w-[45%]">
              {totalBudget != 0 && totalBalance > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">
                    Exhausted Funds Chart
                  </h2>
                  <BudgetAccountComparisonChart
                    budgetTotal={totalBudget}
                    accountTotal={totalBalance}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetDashboard;
