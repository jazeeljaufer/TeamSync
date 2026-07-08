import api from "./api";
import { request } from "./apiHelper";

export const chatWithAI = (message, history = []) => 
  request(() => api.post("/ai/chat", { message, history }));
