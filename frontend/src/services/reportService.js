import api from "./api";
import { request } from "./apiHelper";

export const createReport = (data) => request(() => api.post("/reports", data));

export const getMyReports = () => request(() => api.get("/reports/my"));

export const getReportById = (id) => request(() => api.get(`/reports/${id}`));

export const updateReport = (id, data) => request(() => api.put(`/reports/${id}`, data));

export const submitReport = (id) => request(() => api.patch(`/reports/${id}/submit`));

export const getAllReports = () => request(() => api.get("/reports/manager/all"));

export const filterReports = (params) => 
  request(() => api.get("/reports/manager/filter", { params }));
