"use client";
import React, { useState, useEffect } from "react";
import CreatableSelect from 'react-select/creatable';
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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

const SharedUserDetails = [];
const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

const CreateSharedBudget = () => {
  const [budgetName, setBudgetName] = useState("");
  const [sharedUsers, setSharedUsers] = useState([]);
  const [sharedUserDetails, setSharedUserDetails] = useState(SharedUserDetails);
  const [itemName, setItemName] = useState("");
  const [expenseType, setExpenseType] = useState(expenseOptions[0]);
  const [amount, setAmount] = useState("");
  const [items, setItems] = useState([]);
  const { data: session } = useSession();
  const user = localStorage.getItem("userEmail");

  const month = useSelector(selectTermMonth);
  const year = useSelector(selectTermYear);
  const isEditing = useSelector(editingBudget);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  console.log("baseUrl: " + baseUrl);

  const handleFetchBudgets = async () => {
    try {
      const budgetresponse = await axios.get(`${baseUrl}/get-shared-budgets`, {
        params: {
          user,
          month,
          year,
        },
      });
      console.log(
        "Shared Budgets fetched successfully in create:",
        budgetresponse.data
      );
      console.log( "Shared Budgets fetched successfully in create:", budgetresponse.data);
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
            itemName: budget.itemname,
            expenseType: budget.type,
            amount: budget.amount,
            budgetName: budget.budgetName,
            sharedUsers: budget.sharedUsers.map((member) => ({
              value: member.userName,
              label: member.userEmail,
              perPersonCost:member.perPersonCost
            }))
          })
          );
          console.log(formattedItems);
          // setItems([...items, { budgetName, expenseType, amount, itemName, sharedUsers  }]);
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
    console.log('user details ',sharedUsers);
    if (budgetName && amount) {
      // perPersonCost: (parseFloat(item.amount) / sharedUsers.length).toFixed(2),

      sharedUsers.map(user => ({
        userName: user.label,
        userEmail: user.value,
        perPersonCost: (parseFloat(amount) / sharedUsers.length).toFixed(2),
      })),
      setItems([...items, { budgetName, expenseType, amount, itemName, sharedUsers  }]);
      setAmount("");  
    }
  };

  const handleDeleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    sendAlert("Shared Item deleted", "Failure");
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
    console.log('items ',items);
    const budgets = items.map((item) => ({
      user: user,
      budgetName: budgetName,
      sharedUsers: item.sharedUsers.map(user => ({
        userName: user.label,
        userEmail: user.value,
        perPersonCost: (item.amount / item.sharedUsers.length).toFixed(2)
      })),
      month: month,
      year: year,
      itemname: item.itemName,
      type: item.expenseType,
      amount: parseFloat(item.amount),
      date: formatDate(new Date()),
    }));

    try {
      console.log("Add part", items);
      const response = await fetch(`${baseUrl}/add-shared-budget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(budgets),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Shared Budgets successfully created:", result);
        sendAlert("Shared Budgets successfully created & Email has been sent", "Success");
        setTimeout(() => {
          handleNavigation("/sharedBudgetDashboard");
        },2000);
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
      user: user,
      budgetName: budgetName,
      newBudget: budgetName,
      sharedUsers: item.sharedUsers.map(user => ({
        userName: user.label,
        userEmail: user.value,
        perPersonCost: (item.amount / item.sharedUsers.length).toFixed(2)
      })),month: month,
      year: year,
      itemname: item.itemName,
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
      console.log("Edit part");
      const response = await fetch(`${baseUrl}/edit-shared-budget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Shared Budgets successfully updated:", result);
        sendAlert("Shared Budgets successfully updated & Email has been sent", "Success");
        setTimeout(() => {
          handleNavigation("/sharedBudgetDashboard");
        },2000);
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
    
    <div className="bg-purple-200 flex items-center p-2 shadow-md sticky top-0 z-50 w-full">
      <div className="flex-1 pl-20 pt-5">
        <button
          type="button"
          onClick={() => handleNavigation("/sharedBudgetDashboard")}
          className="ml-auto px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Back
        </button>
      </div>
      <ToastContainer />
      <div className="flex-1 text-center text-xl font-semibold">
        Create a Shared Budget
      </div>
      <div className="pr-20 ml-auto pt-5">
        {!isEditing ? (
          <button
            type="button"
            onClick={handleSubmit}
            className={`px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              !budgetName || items.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!budgetName || items.length === 0}
          >
            Create Shared Budget
          </button>
        ) : (
          <button
            type="button"
            onClick={handleEditBudget}
            className={`px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !budgetName || items.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!budgetName || items.length === 0}
          >
            Edit Budget
          </button>
        )}
      </div>
    </div>
    
    
    <div className="flex flex-row flex-grow">
      
      <div className="w-1/3 p-6 bg-gray-50 border-r border-gray-200">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Add Shared Budget Item</h2>
          <div className="mb-4">
            <label htmlFor="budgetName" className="block text-gray-700 font-medium mb-2">
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
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Item Name:</label>
            <input
              type="text"
              id="items"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter name"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="sharedUsers" className="block text-gray-700 font-medium mb-2">Members:</label>
            <CreatableSelect
              isMulti
              value={sharedUsers}
              onChange={(selected) => setSharedUsers(selected)}
              options={sharedUserDetails}
              placeholder="Select or create users..."
              isValidNewOption={(inputValue, selectValue, selectOptions) => {
                return isValidEmail(inputValue) && !selectOptions.some(option => option.value === inputValue);
              }}
              getNewOptionData={(inputValue, optionLabel) => ({
                value: inputValue,
                label: inputValue,
              })}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="expenseType" className="block text-gray-700 font-medium mb-2">Expense Type:</label>
            <select
              id="expenseType"
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {expenseOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">Amount:</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter amount"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="perHeadCost" className="block text-gray-700 font-medium mb-2">Per Head Cost:</label>
            <label htmlFor="perHeadCostValue" className="block text-gray-700 font-medium mb-2">
              {sharedUsers.length > 0 ? (amount / sharedUsers.length).toFixed(2) : 0 }
            </label>
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
      
      
      <div className="w-2/3 p-6 bg-gray-50 flex flex-col">
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Item Details:</h3>
          <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center border-b border-gray-200">
            <div className="w-1/5"><span className="block text-gray-700 font-medium">Members Name</span></div>
            <div className="w-1/5"><span className="block text-gray-700 font-medium">Item Name</span></div>
            <div className="w-1/5"><span className="block text-gray-700 font-medium">Expense Type</span></div>
            <div className="w-1/5"><span className="block text-gray-700 font-medium">Amount</span></div>
            <div className="w-1/5"><span className="block text-gray-700 font-medium">Per Head Cost</span></div>
          </div>
          <ul className="space-y-4">
            {items.map((item, index) => (
              <li key={index} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center border-b border-gray-200">
                <div className="w-1/5"><span className="block text-gray-700 font-medium"   style={{ width: '160px', wordWrap: 'break-word' }}>{item.sharedUsers.map((user) => user.label).join(', ')}</span></div>
                <div className="w-1/5"><span className="block text-gray-700 font-medium">{item.itemName}</span></div>
                <div className="w-1/5"><span className="block text-gray-700 font-medium">{item.expenseType}</span></div>
                <div className="w-1/5"><span className="block text-gray-800 font-semibold">${item.amount}</span></div>
                <div className="w-1/5 flex items-center justify-between">
                  <span className="text-gray-800 font-semibold">${item.sharedUsers.length > 0 ? (item.amount / item.sharedUsers.length).toFixed(2) : "N/A"}</span>
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
        <div className="text-xl font-semibold mt-4">Total: ${totalAmount.toFixed(2)}</div>
      </div>
    </div>
  </div>
  
  );
};

export default CreateSharedBudget;
