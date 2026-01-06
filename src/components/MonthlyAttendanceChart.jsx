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

  const today = dayjs();
  const startOfMonth = today.startOf("month");

  // ✅ If current month → till today
  // ✅ If past month → full month
  const isCurrentMonth = true; // since you show current month
  const totalDays = isCurrentMonth
    ? today.date()
    : today.daysInMonth();

  const monthlyData = Array.from({ length: totalDays }, (_, i) => {
    const date = startOfMonth.add(i, "day");

    const record = safeAttendance.find(a =>
      dayjs(a.attendanceDate).isSame(date, "day")
    );

    const isPresent =
      record?.attendanceStatus === "PRESENT";

    const isLate =
      isPresent && record?.lateMinutes > 0;

    const isAbsent =
      !record || record?.attendanceStatus === "ABSENT";

    return {
      date: date.format("DD"),
      present: isPresent && !isLate ? 1 : 0,
      late: isLate ? 1 : 0,
      absent: isAbsent ? 1 : 0,
    };
  });

  return (
    <div style={{ width: "100%", height: 280 }}>
      <h4>📆 Monthly Attendance</h4>

      <ResponsiveContainer width="100%" height="100%" minWidth="0" minHeight="0">
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
