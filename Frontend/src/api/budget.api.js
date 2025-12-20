import api from "./axios";

export const setBudget = (data) =>
  api.post("/budget/set", data);

export const getBudgetStatus = (month) =>
  api.get(`/budget/status?month=${month}`);
