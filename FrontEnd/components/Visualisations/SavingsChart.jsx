import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

const SavingsChart = ({ savingsArray, color, bgColor }) => {
  const [pointStyle, setPointStyle] = useState("circle");

  // Function to get last three months
  const getLastThreeMonths = () => {
    const now = new Date();
    const months = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const options = { month: "long" };
      months.push(date.toLocaleDateString("en-US", options));
    }
    return months;
  };
  const labels = getLastThreeMonths();
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Month",
        data: savingsArray,
        borderColor: color,
        backgroundColor: bgColor,
        pointStyle,
        pointRadius: 10,
        pointHoverRadius: 15,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: false,
        text: ``,
      },
    },
  };

  const actions = [{ name: "pointStyle: circle (default)", style: "circle" }];

  return (
    <div>
      <Line data={data} options={options} />
      <div style={{ marginTop: "20px" }}>
        {actions.map((action) => (
          <button
            key={action.name}
            onClick={() => setPointStyle(action.style)}
            style={{ margin: "5px" }}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default SavingsChart;
