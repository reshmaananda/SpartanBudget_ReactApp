"use client";

import { useState } from 'react';
import axios from 'axios';
import Header from "/components/Dashboards/Header";
import Sidepanel from "/components/Dashboards/Sidepanel";
import Head from "next/head";

const SplitBillTo = () => {
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  console.log("baseUrl: " + baseUrl);

  const handleSendEmail = async () => {
    try {
      const response = await fetch(`${baseUrl}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: recipients.split(",").map((email) => email.trim()), // Split by comma and trim spaces
          subject,
          message,
        }),
      });

              if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            alert(data.message);
        } catch (error) {
            alert('Failed to send emails.');
            console.error('Error:', error);
        }
    };

    return (
        <div className="w-screen h-screen">
            <Head>
                <title>Send Email</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header className="h-[5vh]" />
            <main className="flex flex-row h-[95vh] bg-gray-100">
                <div className="w-[18%]">
                    <Sidepanel />
                </div>
                <div className="w-[82%] h-[90%] p-8 bg-white shadow-md rounded-md">
                    <h1 className="text-2xl font-bold mb-4">Send Email to Multiple Recipients</h1>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Recipients (comma separated):</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={recipients}
                            onChange={(e) => setRecipients(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Subject:</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Message:</label>
                        <textarea
                            className="w-full p-2 border border-gray-300 rounded"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                    </div>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                        onClick={handleSendEmail}
                    >
                        Send Email
                    </button>
                </div>
            </main>
        </div>
    );
};

export default SplitBillTo;
