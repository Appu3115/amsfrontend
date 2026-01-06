import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

const WeeklyAttendanceChart = ({ attendance }) => {
  const safeAttendance = Array.isArray(attendance) ? attendance : [];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = dayjs().subtract(6 - i, "day");

    const record = safeAttendance.find(a =>
      dayjs(a.attendanceDate).isSame(date, "day")
    );

    const isPresent =
      record?.attendanceStatus === "PRESENT";

    const isLate =
      isPresent && record?.lateMinutes > 0;

    const isAbsent = !record;

    return {
      day: date.format("DD MMM"),
      present: isPresent ? 1 : 0,
      late: isLate ? 1 : 0,
      absent: isAbsent ? 1 : 0,
    };
  });

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h4>📅 Weekly Attendance</h4>

   <ResponsiveContainer width="100%" height="100%" minWidth="0" minHeight="0">
        <BarChart data={last7Days}>
          <XAxis dataKey="day" />
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

export default WeeklyAttendanceChart;
