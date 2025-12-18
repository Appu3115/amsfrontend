import axios from "axios";

const BASE_URL = "http://localhost:8080/department";

export const addDepartment = (deptName) => {
  return axios.post(`${BASE_URL}/add`, {
    deptName: deptName,
  });
};

export const fetchAllDepartments = () => {
  return axios.get(`${BASE_URL}/fetchAll`);
};

export const fetchActiveDepartments = () => {
  return axios.get(`${BASE_URL}/fetchActiveDept`);
};

export const getDepartmentById = (id) => {
  return axios.get(`${BASE_URL}/getDept/${id}`);
};

export const disableDepartment = (id) => {
  return axios.delete(`${BASE_URL}/disable/${id}`);
};

export const updateDepartment = (id, deptName) => {
  return axios.put(`${BASE_URL}/update/${id}`, {
    deptName: deptName,
  });
};
