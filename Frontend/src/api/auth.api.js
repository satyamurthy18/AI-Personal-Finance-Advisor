import api from "./axios";

export const login = (data) => api.post("/auth/login", data);
export const signup = (data) => api.post("/auth/signup", data);
export const logout = () => api.post("/auth/logout");
export const forgotPassword = (email) => api.post("/auth/forgot-password", { emailId: email });
export const resetPassword = (token, password) => api.post("/auth/reset-password", { token, password });
