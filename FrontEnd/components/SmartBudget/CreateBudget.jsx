"use client";
import React, { useState, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  selectTermMonth,
  selectTermYear,
  editingBudget,
} from "/public/src/feature/termSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sendAlert } from "../Services/AlertServices";

const expenseOptions = [
  "Food",
  "Tuition",
  "Transport",
  "Entertainment",
  "Medical",
  "Insurance",
  "Creditcards",
  "Loans",
  "Personal",
];

const CreateBudget = () => {
  const [budgetName, setBudgetName] = useState("");
  const [name, setName] = useState("");
  const [expenseType, setExpenseType] = useState(expenseOptions[0]);
  const [amount, setAmount] = useState("");
  const [items, setItems] = useState([]);
  const user = localStorage.getItem("userEmail");

  const month = useSelector(selectTermMonth);
  const year = useSelector(selectTermYear);
  const isEditing = useSelector(editingBudget);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  console.log("baseUrl: " + baseUrl);

  const router = useRouter();

  const handleFetchBudgets = async () => {
    try {
      const budgetresponse = await axios.get(`${baseUrl}/get-budgets`, {
        params: {
          user,
          month,
          year,
        },
      });
      console.log(
        "Budgets fetched successfully in create:",
        budgetresponse.data
      );
      if (
        (budgetresponse != undefined &&
          budgetresponse.data != undefined &&
          budgetresponse.data[0] != undefined) ||
        (budgetresponse.data[0] != null &&
          budgetresponse.data[0].budgetName != undefined)
      ) {
        // Ensure data structure matches expected format
        if (Array.isArray(budgetresponse.data)) {
          const formattedItems = budgetresponse.data.map((budget) => ({
            name: budget.itemname,
            expenseType: budget.type,
            amount: budget.amount,
            budgetName: budget.budgetName,
          }));

          setItems(formattedItems);
          setBudgetName(budgetresponse.data[0].budgetName);
        } else {
          console.error("Unexpected data format:", budgetresponse.data);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (user && month && year) {
      handleFetchBudgets();
    }
  }, [user, month, year]);

  const handleAddItem = () => {
    if (name && amount) {
      setItems([...items, { name, expenseType, amount }]);
      setName("");
      setAmount("");
    }
  };

  const handleDeleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce(
    (acc, item) => acc + parseFloat(item.amount),
    0
  );

  const handleNavigation = (path) => {
    router.push(path);
  };

  const handleSubmit = async () => {
    const formatDate = (date) => {
      const d = new Date(date);
      const month = `${d.getMonth() + 1}`.padStart(2, "0");
      const day = `${d.getDate()}`.padStart(2, "0");
      const year = d.getFullYear();
      return `${month}-${day}-${year}`;
    };

    const budgets = items.map((item) => ({
      budgetName: budgetName,
      user: user,
      month: month,
      year: year,
      itemname: item.name,
      type: item.expenseType,
      amount: parseFloat(item.amount),
      date: formatDate(new Date()),
    }));

    try {
      const response = await fetch(`${baseUrl}/add-budget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ budgets: budgets }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Budgets successfully created:", result);
        sendAlert("Created Budget", "Success");
        setTimeout(() => {
          handleNavigation("/budgetDashboard");
        }, 2000);
      } else {
        const error = await response.json();
        console.error("Error creating budgets:", error);
        sendAlert("Unexpected Error Occurred", "Failure");
      }
    } catch (error) {
      showNotification("Unexpected Error Occurred", "error");
      console.error("Network error:", error);
    }
  };

  const handleEditBudget = async () => {
    const formatDate = (date) => {
      const d = new Date(date);
      const month = `${d.getMonth() + 1}`.padStart(2, "0");
      const day = `${d.getDate()}`.padStart(2, "0");
      const year = d.getFullYear();
      return `${month}-${day}-${year}`;
    };

    const budgetsToUpdate = items.map((item) => ({
      budgetName: budgetName,
      newBudget: budgetName,
      user: user,
      month: month,
      year: year,
      itemname: item.name,
      type: item.expenseType,
      amount: parseFloat(item.amount),
      date: formatDate(new Date()),
    }));

    const requestPayload = {
      user: user,
      month: month,
      year: year,
      budgetsToUpdate: budgetsToUpdate,
    };
    console.log(requestPayload);

    try {
      const response = await fetch(`${baseUrl}/edit-budget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Budgets successfully edited:", result);
        sendAlert("Edited Budget", "Success");
        setTimeout(() => {
          handleNavigation("/budgetDashboard");
        }, 2000);
      } else {
        const error = await response.json();
        sendAlert("Unexpected Error Occurred", "Failure");
        console.error("Error editing budgets:", error);
      }
    } catch (error) {
      showNotification("Unexpected Error Occurred", "error");
      console.error("Network error:", error);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="bg-purple-200 flex items-center p-2 shadow-md top-0 sticky z-50 w-screen">
        <div className="pl-20 pt-5">
          <button
            type="button"
            onClick={() => handleNavigation("/budgetDashboard")}
            className="ml-auto self-end mb-4 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md
             hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Back
          </button>
        </div>
        <ToastContainer />
        <div className="flex-grow text-center text-xl font-semibold">
          Create a budget
        </div>
        <div className="pr-20 ml-auto pt-5">
          {!isEditing && (
            <button
              type="button"
              onClick={handleSubmit}
              className={`self-end mb-4 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md
              hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                !budgetName || items.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={!budgetName || items.length === 0}
            >
              Create Budget
            </button>
          )}
          {isEditing && (
            <button
              type="button"
              onClick={handleEditBudget}
              className={`self-end mb-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !budgetName || items.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={!budgetName || items.length === 0}
            >
              Edit Budget
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-row w-screen">
        <div className="w-1/3 p-6 bg-gray-50 border-r border-gray-200">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Add Budget Item
            </h2>
            <div className="mb-4">
              <label
                htmlFor="budgetName"
                className="block text-gray-700 font-medium mb-2"
              >
                Budget Name:
              </label>
              <input
                type="text"
                id="budgetName"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter budget name"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 font-medium mb-2"
              >
                Name:
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter name"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="expenseType"
                className="block text-gray-700 font-medium mb-2"
              >
                Expense Type:
              </label>
              <select
                id="expenseType"
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {expenseOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-gray-700 font-medium mb-2"
              >
                Amount:
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter amount"
              />
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Add Item
            </button>
          </div>
        </div>

        <div className="w-2/3 p-6 bg-gray-50 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Items:</h3>
            <ul className="space-y-4">
              {items.map((item, index) => (
                <li
                  key={index}
                  className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
                >
                  <div>
                    <span className="block text-gray-700 font-medium">
                      {item.name}
                    </span>
                    <span className="block text-gray-500 text-sm">
                      {item.expenseType}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-semibold mr-4">
                      ${item.amount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(index)}
                      className="text-red-600 hover:text-red-800 focus:outline-none"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-xl font-semibold mt-4">
            Total: ${totalAmount.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBudget;
