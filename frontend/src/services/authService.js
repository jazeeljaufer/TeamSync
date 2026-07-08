import api from "./api";

const getErrorMessage = (error) => {
  const data = error.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.map((item) => item.msg).join(" ");
  }
  return data?.message || error.message || "Request failed. Please try again.";
};

const request = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const login = (credentials) => request(() => api.post("/auth/login", credentials));
export const register = (details) => request(() => api.post("/auth/register", details));
export const verifyRegistration = (details) => request(() => api.post("/auth/verify-registration", details));
export const forgotPassword = (email) => request(() => api.post("/auth/forgot-password", { email }));
export const resetPassword = ({ email, otp, password }) => request(() => api.post("/auth/reset-password", { email, otp, password }));
export const resendOTP = ({ email, type }) => request(() => api.post("/auth/resend-otp", { email, type }));
export const getProfile = () => request(() => api.get("/auth/profile"));
export const updateProfile = (data) => request(() => api.put("/auth/profile", data));
export const getTeamMembers = () => request(() => api.get("/auth/team-members"));
