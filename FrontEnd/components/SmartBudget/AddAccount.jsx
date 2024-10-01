"use client";
import React from "react";
import { useState } from "react";

const accountOptions = [
  "Savings",
  "Earnings",
  "Checking",
  "Investments",
  "Growth",
];

const AddAccount = () => {
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState(accountOptions[0]);
  const [amount, setAmount] = useState("");
  const [items, setItems] = useState([]);

  const handleAddItem = () => {
    if (name && amount) {
      setItems([...items, { name, accountType, amount }]);
      setName("");
      setAmount("");
    }
  };

  const handleSubmit = () => {
    // Handle the submit action
    console.log("Items to submit:", items);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add Account</h2>

      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
          Account Name:
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
          htmlFor="accountType"
          className="block text-gray-700 font-medium mb-2"
        >
          Account Type:
        </label>
        <select
          id="accountType"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {accountOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
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
        Add Account
      </button>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Items:</h3>
        <ul className="list-disc pl-5 space-y-2">
          {items.map((item, index) => (
            <li key={index} className="text-gray-700">
              {item.name} - {item.accountType} - ${item.amount}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 mt-6"
      >
        Add Account
      </button>
    </div>
  );
};

export default AddAccount;
