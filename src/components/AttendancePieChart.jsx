import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts";

const COLORS = ["#22c55e", "#f97316", "#ef4444"];

const AttendancePieChart = ({ attendance }) => {
  const count = status =>
    attendance.filter(a => a.status === status).length;

  const data = [
    { name: "Present", value: count("PRESENT") },
    { name: "Late", value: count("LATE") },
    { name: "Absent", value: count("ABSENT") },
  ];

  return (
    <div style={{ height: 300 }}>
      <h4>🥧 Attendance Overview</h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={100}
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendancePieChart;
