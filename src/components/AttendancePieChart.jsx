import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const COLORS = ["#16a34a", "#f97316", "#dc2626"]; // Present, Late, Absent

const AttendancePieChart = ({ attendance = [] }) => {
  if (!Array.isArray(attendance) || attendance.length === 0) {
    return <p>No attendance data</p>;
  }

  const presentCount = attendance.filter(
    (a) =>
      a.attendanceStatus === "PRESENT" &&
      (!a.lateMinutes || a.lateMinutes === 0)
  ).length;

  const lateCount = attendance.filter(
    (a) =>
      a.attendanceStatus === "PRESENT" &&
      a.lateMinutes > 0
  ).length;

  const absentCount = attendance.filter(
    (a) => a.attendanceStatus === "ABSENT"
  ).length;

  const total = presentCount + lateCount + absentCount;

  if (total === 0) {
    return <p>No valid attendance records</p>;
  }

  // ✅ Convert to percentage
  const data = [
    {
      name: "Present",
      value: Number(((presentCount / total) * 100).toFixed(1)),
    },
    {
      name: "Late",
      value: Number(((lateCount / total) * 100).toFixed(1)),
    },
    {
      name: "Absent",
      value: Number(((absentCount / total) * 100).toFixed(1)),
    },
  ];

  return (
    <div style={{ width: "100%", height: 320 }}>
 
      <h4 style={{ marginBottom: 12 }}>
        📊 Attendance Percentage (You)
      </h4>

       <ResponsiveContainer width="100%" height="100%" minWidth="0" minHeight="0" aspect={undefined}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, value }) => `${name}: ${value}%`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>

          <Tooltip formatter={(value) => `${value}%`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendancePieChart;
