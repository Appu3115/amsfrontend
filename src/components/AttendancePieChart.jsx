import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const COLORS = ["#16a34a", "#dc2626"];

const AttendancePieChart = ({ attendance = [] }) => {
  if (!Array.isArray(attendance) || attendance.length === 0) {
    return <p>No attendance data</p>;
  }

  const present = attendance.filter((a) => a.logout).length;
  const absent = attendance.length - present;

  const data = [
    { name: "Present", value: present },
    { name: "Absent", value: absent },
  ];

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <h4 style={{ marginBottom: 12 }}>📊 Attendance Summary</h4>

      <div style={{ width: "100%", height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendancePieChart;
