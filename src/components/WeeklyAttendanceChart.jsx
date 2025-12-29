import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import dayjs from "dayjs";

const WeeklyAttendanceChart = ({ attendance }) => {
  const last7Days = [...Array(7)].map((_, i) => {
    const date = dayjs().subtract(6 - i, "day");
    const record = attendance.find(
      a => dayjs(a.attendanceDate).isSame(date, "day")
    );

    return {
      day: date.format("DD MMM"),
      present: record?.status === "PRESENT" ? 1 : 0,
      late: record?.status === "LATE" ? 1 : 0,
      absent: record?.status === "ABSENT" ? 1 : 0,
    };
  });

  return (
    <div style={{ height: 300 }}>
      <h4>📅 Weekly Attendance</h4>
      <ResponsiveContainer width="100%" height="100%">
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
