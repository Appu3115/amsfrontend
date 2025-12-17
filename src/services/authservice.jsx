import api from "../api/axios";

export const loginApi = (payload) =>
  api.post("/user/login", payload);

export const registerApi = (payload) =>
  api.post("/user/register", payload);
