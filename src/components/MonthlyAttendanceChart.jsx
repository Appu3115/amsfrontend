import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

const MonthlyAttendanceChart = ({ attendance }) => {
  const safeAttendance = Array.isArray(attendance) ? attendance : [];

  if (safeAttendance.length === 0) {
    return <p>No monthly data</p>;
  }

  const currentMonth = dayjs().month();

  const monthlyData = safeAttendance
    .filter((a) => dayjs(a.attendanceDate).month() === currentMonth)
    .map((a) => ({
      date: dayjs(a.attendanceDate).format("DD"),
      present: a.status === "PRESENT" ? 1 : 0,
      late: a.status === "LATE" ? 1 : 0,
      absent: a.status === "ABSENT" ? 1 : 0,
    }));

  if (monthlyData.length === 0) {
    return <p>No data for this month</p>;
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h4>📆 Monthly Attendance</h4>

      <ResponsiveContainer width="100%" aspect={2.5}>
  <BarChart data={monthlyData}>
    <XAxis dataKey="date" />
    <YAxis allowDecimals={false} />
    <Tooltip />
    <Bar dataKey="present" fill="#22c55e" />
    <Bar dataKey="late" fill="#f97316" />
    <Bar dataKey="absent" fill="#ef4444" />
  </BarChart>
</ResponsiveContainer>

    </div>
  );
};

export default MonthlyAttendanceChart;
