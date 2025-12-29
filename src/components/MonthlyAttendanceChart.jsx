import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import dayjs from "dayjs";

const MonthlyAttendanceChart = ({ attendance }) => {
  const currentMonth = dayjs().month();

  const monthlyData = attendance
    .filter(a => dayjs(a.attendanceDate).month() === currentMonth)
    .map(a => ({
      date: dayjs(a.attendanceDate).format("DD"),
      present: a.status === "PRESENT" ? 1 : 0,
      late: a.status === "LATE" ? 1 : 0,
      absent: a.status === "ABSENT" ? 1 : 0,
    }));

  return (
    <div style={{ height: 300 }}>
      <h4>📆 Monthly Attendance</h4>
      <ResponsiveContainer width="100%" height="100%">
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
