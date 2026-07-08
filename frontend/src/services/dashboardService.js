import api from "./api";
import { request } from "./apiHelper";

export const getSummary = () => request(() => api.get("/dashboard/summary"));

export const getCharts = () => request(() => api.get("/dashboard/charts"));

export const getRecentActivity = () => request(() => api.get("/dashboard/recent"));
