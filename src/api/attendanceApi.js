import axios from "axios";

const BASE_URL = "http://localhost:8080/attendance";

export const punchIn = (employeeId) => {
  return axios.post(`${BASE_URL}/login`, {
    employeeId: employeeId,
  });
};

export const punchOut = (attendanceId) => {
  return axios.post(`${BASE_URL}/logout/${attendanceId}`);
};

export const fetchAttendance = (employeeId, date) => {
  return axios.get(`${BASE_URL}/fetch`, {
    params: {
      employeeId: employeeId || null,
      date: date || null,
    },
  });
};

export const getDepartmentWiseAttendance = () => {
  return axios.get(`${BASE_URL}/department-wise`);
};
