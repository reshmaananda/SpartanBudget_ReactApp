"use client";

import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import axios from "axios";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { FaEdit, FaInfoCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { HashLoader } from "react-spinners";
import SavingsChart from "../Visualisations/SavingsChart";
import { AiOutlineComment } from "react-icons/ai";

const FinancialGoalDashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccounttDialogOpen] = useState(false);
  const [isSavingsDialogOpen, setIsSavingsDialogOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isHovered, setIsHovered] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  console.log("baseUrl: " + baseUrl);

  const handleMouseEnter = (goalId) => {
    setIsHovered(goalId);
  };

  const handleMouseLeave = () => {
    setIsHovered(null);
  };
  const [goalForm, setGoalForm] = useState({
    name: "",
    amountRequired: "",
    amountSaved: "",
    notes: "",
  });

  const [totalBudgetArray, setTotalBudgetArray] = useState([]);
  const [totalBalanceArray, setTotalBalanceArray] = useState([]);
  const [monthlySavingsArray, setMonthlySavingsArray] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getMonthName = (monthNumber) => {
    // monthNumber is zero-based (0 for January, 1 for February, etc.)
    return monthNames[monthNumber] || "Unknown";
  };

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const user = localStorage.getItem("userEmail");
        if (user) {
          console.log("url", `${baseUrl}/get-goals`);
          const response = await axios.get(`${baseUrl}/get-goals`, {
            params: {
              user,
            },
          });
          setGoals(response.data.goals);
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };

    fetchGoals();
    fetchPastThreeMonthsData();
  }, []);

  useEffect(() => {
    calculatePredictions();
  }, [monthlySavingsArray, goals]);

  const fetchPastThreeMonthsData = async () => {
    try {
      setLoading(true); // Show loading spinner

      const user = localStorage.getItem("userEmail");
      const currentDate = new Date();
      const pastMonths = [
        {
          month: getMonthName(currentDate.getMonth() - 5),
          year: currentDate.getFullYear(),
        },
        {
          month: getMonthName(currentDate.getMonth() - 4),
          year: currentDate.getFullYear(),
        },
        {
          month: getMonthName(currentDate.getMonth() - 3),
          year: currentDate.getFullYear(),
        },
        {
          month: getMonthName(currentDate.getMonth() - 2),
          year: currentDate.getFullYear(),
        },
        {
          month: getMonthName(currentDate.getMonth() - 1),
          year: currentDate.getFullYear(),
        },
      ];

      const budgetPromises = pastMonths.map(({ month, year }) =>
        axios.get(`${baseUrl}/get-budgets`, {
          params: { user, month, year },
        })
      );

      const accountPromises = pastMonths.map(({ month, year }) =>
        axios.get(`${baseUrl}/get-accounts`, {
          params: { user, month, year },
        })
      );

      const [budgetResponses, accountResponses] = await Promise.all([
        Promise.all(budgetPromises),
        Promise.all(accountPromises),
      ]);

      // Wait for 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));

      console.log("budgetResponses", budgetResponses);
      console.log("accountResponses", accountResponses);

      const totalBudgetArray = budgetResponses.map((response) => {
        return response.data.reduce((total, item) => total + item.amount, 0);
      });

      const totalBalanceArray = accountResponses.map((response) => {
        return response.data.reduce((total, item) => total + item.amount, 0);
      });

      // Calculate monthly savings
      const monthlySavingsArray = totalBalanceArray.map((balance, index) => {
        return balance - (totalBudgetArray[index] || 0);
      });

      console.log(monthlySavingsArray);

      setTotalBudgetArray(totalBudgetArray);
      setTotalBalanceArray(totalBalanceArray);
      setMonthlySavingsArray(monthlySavingsArray);
      setLoading(false); // Hide loading spinner
    } catch (error) {
      console.error("Error fetching past three months' data:", error);
      setLoading(false); // Hide loading spinner in case of error
    }
  };

  const openDialog = (goal = null) => {
    setSelectedGoal(goal);
    setGoalForm({
      name: goal?.goalItem || "",
      amountRequired: goal?.amountRequired || "",
      amountSaved: goal?.amountSaved || "",
      notes: goal?.notes || "",
    });
    setIsDialogOpen(true);
  };

  const openBudgetDialog = () => {
    setIsBudgetDialogOpen(true);
  };
  const openAccountsDialog = () => {
    setIsAccounttDialogOpen(true);
  };
  const openSavingsDialog = () => {
    setIsSavingsDialogOpen(true);
  };

  const closeDialog = () => setIsDialogOpen(false);
  const closeBudgetDialog = () => setIsBudgetDialogOpen(false);
  const closeAccountsDialog = () => setIsAccounttDialogOpen(false);
  const closeSavingsDialog = () => setIsSavingsDialogOpen(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setGoalForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const user = localStorage.getItem("userEmail");
      const goal = {
        goalItem: goalForm.name,
        user: user,
        amountRequired: parseFloat(goalForm.amountRequired),
        amountSaved: parseFloat(goalForm.amountSaved),
        notes: goalForm.notes,
      };

      await fetch(`${baseUrl}/add-goal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goal),
      });

      const response = await axios.get(`${baseUrl}/get-goals`, {
        params: {
          user,
        },
      });
      setGoals(response.data.goals);
      closeDialog();
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    try {
      const user = localStorage.getItem("userEmail");
      const goal = {
        goalItem: selectedGoal.goalItem,
        user: user,
        updatedGoal: {
          goalItem: goalForm.name,
          amountRequired: parseFloat(goalForm.amountRequired),
          amountSaved: parseFloat(goalForm.amountSaved),
          notes: goalForm.notes,
        },
      };

      await fetch(`${baseUrl}/edit-goal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goal),
      });

      const response = await axios.get(`${baseUrl}/get-goals`, {
        params: {
          user,
        },
      });
      setGoals(response.data.goals);
      closeDialog();
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const handleDeleteGoal = async (goalItem) => {
    try {
      const user = localStorage.getItem("userEmail");
      await fetch(`${baseUrl}/delete-goal`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user, goalItem }),
      });

      const response = await axios.get(`${baseUrl}/get-goals`, {
        params: { user },
      });
      setGoals(response.data.goals);
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const handleTileClick = (goal) => openDialog(goal);
  const handleBudgetClick = () => openBudgetDialog();
  const handleAccountsClick = () => openAccountsDialog();
  const handleSavingsClick = () => openSavingsDialog();

  const calculatePredictions = () => {
    const averageMonthlySavings =
      monthlySavingsArray.reduce((acc, curr) => acc + curr, 0) /
      monthlySavingsArray.length;

    const predictions = goals.map((goal) => {
      const remainingAmount = goal.amountRequired - goal.amountSaved;
      const monthsToReachGoal = remainingAmount / averageMonthlySavings;
      return { ...goal, monthsToReachGoal: Math.ceil(monthsToReachGoal) };
    });

    setPredictions(predictions);
  };

  return (
    <div className="flex flex-row h-[85vh] bg-purple-200">
      <div className="pl-1 mt-3 w-[24vw]">
        <div className="flex flex-col">
          <div className="h-[15vh] flex flex-col justify-center items-center">
            <h3 className="text-l font-bold mt-3 mb-3">Create Goals</h3>
            <button
              onClick={() => openDialog()}
              className="flex items-center justify-between p-4 mb-4 bg-pink-300 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-100 cursor-pointer"
            >
              <span className="text-gray-700 font-bold">Add New Goal</span>
            </button>
          </div>
          <div className="h-[60vh] p-4 overflow-y-auto">
            <h3 className="text-l font-bold mb-4">My Goals</h3>
            {goals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {goals.map((goal) => (
                  <div
                    key={goal._id}
                    className="flex flex-col bg-white rounded-lg shadow-lg hover:shadow-xl 
                    transition-shadow duration-300 cursor-pointer px-2 py-2 relative h-[18vh]"
                  >
                    {/* Goal Title */}
                    <div className="h-[15%] w-full">
                      <div>
                        <h3 className=" pt-2 ml-2 text-xl font-bold mb-2 truncate text-purple-700">
                          {goal.goalItem}
                        </h3>
                      </div>
                    </div>
                    <div className="h-[85%] w-full">
                      <div className="flex flex-row">
                        <div className="ml-7 w-[80%] h-full flex justify-center mb-3">
                          <Gauge
                            width={110}
                            height={110}
                            value={goal.amountSaved}
                            valueMax={goal.amountRequired}
                            startAngle={-120}
                            endAngle={120}
                            sx={{
                              [`& .${gaugeClasses.valueText}`]: {
                                fontSize: 13,
                                fontWeight: "bold",
                                transform: "translate(0px, 0px)",
                              },
                              [`& .${gaugeClasses.valueArc}`]: {
                                fill: "#1DB954",
                              },
                            }}
                            text={({ value, valueMax }) =>
                              `${goal.amountSaved} / ${goal.amountRequired}`
                            }
                          />
                        </div>
                        {/* Gauge */}
                        <div className="w-[15%] h-full">
                          <div
                            onMouseEnter={() => handleMouseEnter(goal._id)}
                            onMouseLeave={handleMouseLeave}
                            className="relative"
                          >
                            <AiOutlineComment
                              size={20}
                              className="cursor-pointer text-purple-500  hover:purple-red-700 transition-colors duration-200"
                            />
                            {isHovered === goal._id && (
                              <div
                                className="w-[7vw] absolute bottom-full mb-2 transform 
                              -translate-x-1/2 bg-gray-700 text-white text-xs p-2 rounded mr-1"
                              >
                                {goal.notes}
                              </div>
                            )}
                          </div>
                          <FaEdit
                            className="mt-2 ml-1 mb-1 text-blue-500 cursor-pointer hover:text-blue-700 transition-colors duration-200"
                            onClick={() => handleTileClick(goal)}
                            size={20}
                          />
                          <MdDelete
                            className="pr-2 text-red-500 cursor-pointer hover:text-red-700 transition-colors duration-200"
                            onClick={() => handleDeleteGoal(goal.goalItem)}
                            size={30}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                You dont have any goals yet..Add some!!
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="pl-2 mt-3 w-[60vw]">
        <div className="h-[75vh] flex flex-col p-4 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-100 cursor-pointer">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <HashLoader size={30} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col">
                <div className=" h-[35vh] ">
                  <div className="flex flex-row space-x-0.5">
                    <div
                      className="w-[19vw] mr-0.5"
                      onClick={() => handleSavingsClick()}
                    >
                      <h3 className="text-m font-bold mb-4">
                        Your Savings Trend
                      </h3>
                      <div className="flex flex-col ">
                        <div className="bg-white rounded-lg shadow-md p-2 ">
                          <SavingsChart
                            savingsArray={monthlySavingsArray}
                            color={"green"}
                            bgColor={"rgba(75, 192, 192, 0.5)"}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className="w-[19vw] mr-0.5"
                      onClick={() => handleBudgetClick()}
                    >
                      <h3 className="text-m font-bold mb-4">
                        Your Budget Trend
                      </h3>
                      <div className="flex flex-col ">
                        <div className="bg-white rounded-lg shadow-md p-2 ">
                          <SavingsChart
                            savingsArray={totalBudgetArray}
                            color={"red"}
                            bgColor={"rgba(255, 99, 132, 0.5)"}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className="w-[19vw]"
                      onClick={() => handleAccountsClick()}
                    >
                      <h3 className="text-m font-bold mb-4">
                        Your Balances Trend
                      </h3>
                      <div className="flex flex-col ">
                        <div className="bg-white rounded-lg shadow-md p-2">
                          <SavingsChart
                            savingsArray={totalBalanceArray}
                            color={"blue"}
                            bgColor={"rgba(54, 162, 235, 0.5)"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className=" h-[35vh] overflow-y-auto">
                  <div className="flex">
                    <span className="text-l font-bold mb-2 mt-2">
                      Predictions
                    </span>
                    <i
                      className="tooltip"
                      title="Months to save is calculated by dividing the remaining amount by the average monthly savings."
                    >
                      <FaInfoCircle
                        size={20}
                        className="mt-2 ml-2 text-blue-500 cursor-pointer hover:text-blue-700 transition-colors duration-200"
                      />
                    </i>
                  </div>
                  {predictions.length > 0 && goals.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {predictions.map((goal) => (
                        <div
                          key={goal.id}
                          className="bg-white p-4 rounded-lg shadow-sm"
                        >
                          <div className="text-sm font-medium text-purple-800">
                            {goal.goalItem}
                          </div>
                          <p className="text-gray-600">
                            Based on your current savings, you will be able to
                            save for this goal in approximately
                            <span className="pl-1 font-bold text-green-600">
                              {goal.monthsToReachGoal} months
                            </span>
                            .
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      You dont have any goals yet..Add goals to see
                      predictions!!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isDialogOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={closeDialog}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-[30vw] h-[70vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <AiOutlineClose
              className="absolute top-3 right-3 text-gray-500 cursor-pointer"
              onClick={closeDialog}
              size={24}
            />
            <h2 className="text-lg font-bold mb-4">
              {selectedGoal ? "Edit Goal" : "Add New Goal"}
            </h2>
            <form>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700">
                  Goal Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={goalForm.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="amountRequired" className="block text-gray-700">
                  Amount Required
                </label>
                <input
                  id="amountRequired"
                  type="number"
                  step="0.01"
                  value={goalForm.amountRequired}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="amountSaved" className="block text-gray-700">
                  Amount Saved
                </label>
                <input
                  id="amountSaved"
                  type="number"
                  step="0.01"
                  value={goalForm.amountSaved}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="notes" className="block text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={goalForm.notes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                />
              </div>
              <div className="flex justify-center">
                {selectedGoal ? (
                  <button
                    onClick={handleUpdateGoal}
                    className="bg-purple-500  text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-100"
                  >
                    Update Goal
                  </button>
                ) : (
                  <button
                    onClick={handleAddGoal}
                    className="bg-purple-500  text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-100"
                  >
                    Add Goal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {isSavingsDialogOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={closeSavingsDialog}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg relative"
            style={{ width: "700px", height: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <AiOutlineClose
              className="absolute top-3 right-3 text-gray-500 cursor-pointer"
              onClick={closeSavingsDialog}
              size={24}
            />
            <h2 className="text-lg font-bold mb-4">Your Savings Trend</h2>
            <SavingsChart
              savingsArray={monthlySavingsArray}
              color={"green"}
              bgColor={"rgba(75, 192, 192, 0.5)"}
            />
          </div>
        </div>
      )}

      {isAccountDialogOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={closeAccountsDialog}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg relative"
            style={{ width: "700px", height: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <AiOutlineClose
              className="absolute top-3 right-3 text-gray-500 cursor-pointer"
              onClick={closeAccountsDialog}
              size={24}
            />
            <h2 className="text-lg font-bold mb-4">Your Balances Trend</h2>
            <SavingsChart
              savingsArray={totalBalanceArray}
              color={"blue"}
              bgColor={"rgba(54, 162, 235, 0.5)"}
            />
          </div>
        </div>
      )}

      {isBudgetDialogOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={closeBudgetDialog}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg relative"
            style={{ width: "700px", height: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <AiOutlineClose
              className="absolute top-3 right-3 text-gray-500 cursor-pointer"
              onClick={closeBudgetDialog}
              size={24}
            />
            <h2 className="text-lg font-bold mb-4">Your Budgets Trend</h2>
            <SavingsChart
              savingsArray={totalBudgetArray}
              color={"red"}
              bgColor={"rgba(255, 99, 132, 0.5)"}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialGoalDashboard;
