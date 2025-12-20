import api from "./axios";

export const getTransactions = (params) =>
  api.get("/transactions", { params });

export const addTransaction = (data) =>
  api.post("/transactions/add", data);

export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`);

export const uploadCSV = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/transactions/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
