import api from "./axios";

export const analyzeSpending = (month) =>
  api.post("/ai/analyze", { month });

export const getAnalysis = (month) =>
  api.get(`/ai/analysis?month=${month}`);

export const getAllAnalyses = () =>
  api.get("/ai/analyses");
