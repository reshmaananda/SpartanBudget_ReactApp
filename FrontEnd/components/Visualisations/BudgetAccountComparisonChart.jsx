// components/Dashboards/BudgetAccountComparisonChart.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

const CustomLabel = ({ value }) => (
  <text color="#dddd" fontSize="14" fontWeight="bold" textAnchor="middle">
    {value}
  </text>
);

const BudgetAccountComparisonChart = ({ budgetTotal, accountTotal }) => {
  const data = [
    {
      name: "Budget Total",
      budget: budgetTotal,
    },
    {
      name: "Account Total",
      account: accountTotal,
    },
  ];

  return (
    <div
      className="flex items-center justify-between p-4 mb-4 bg-gray-100 rounded-lg shadow-md hover:shadow-lg 
          transition-shadow duration-100 cursor-pointer"
    >
      <div className="pl-5 text-white">
        <BarChart
          width={450}
          height={270}
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" />
          <Tooltip />

          <Legend />

          <Bar
            dataKey="budget"
            fill="#E3180D"
            barSize={50}
            barGap={2}
            barCategoryGap={10}
          >
            <LabelList
              dataKey="budget"
              position="inside"
              content={<CustomLabel />}
            />
          </Bar>
          <Bar
            dataKey="account"
            fill="#198450"
            barSize={50}
            barGap={2}
            barCategoryGap={10}
          >
            <LabelList
              dataKey="account"
              position="inside"
              content={<CustomLabel />}
            />
          </Bar>
        </BarChart>
      </div>
    </div>
  );
};

export default BudgetAccountComparisonChart;
