import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
  Sector,
} from "recharts";

// Define the custom active shape component (if needed)
const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 20}
        outerRadius={outerRadius + 30}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const UserDivisionPieChart = ({ data }) => {
  const pieData = data.map((user) => ({
    name: user.userEmail,
    value: user.perPersonCost,
  }));

  const COLORS = [
    "#EF404A",
    "#FFD400",
    "#80B463",
    "#27AAE1",
    "#9E7EB9",
    "#26F1D5",
    "#CEFF00",
    "#00001C",
  ];

  return (
    <div
      className="flex items-center justify-between p-4 mb-4 bg-gray-100 rounded-lg shadow-md hover:shadow-lg 
            transition-shadow duration-100 cursor-pointer"
    >
      <ResponsiveContainer width={300} height={270}>
        <PieChart>
          <Pie
            data={pieData}
            cx="100%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            activeShape={renderActiveShape}
            
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ paddingLeft: "20px", right: "-198px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserDivisionPieChart;
