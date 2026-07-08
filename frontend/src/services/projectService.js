import api from "./api";
import { request } from "./apiHelper";

export const getProjects = () => request(() => api.get("/projects"));

export const createProject = (data) => request(() => api.post("/projects", data));

export const getProjectById = (id) => request(() => api.get(`/projects/${id}`));

export const updateProject = (id, data) => request(() => api.put(`/projects/${id}`, data));

export const deleteProject = (id) => request(() => api.delete(`/projects/${id}`));

export const assignMembers = (id, data) => request(() => api.patch(`/projects/${id}/assign`, data));
