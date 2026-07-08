import api from "./api";

export const getErrorMessage = (error) => {
  const data = error.response?.data;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.map((item) => item.msg).join(" ");
  }

  return data?.message || error.message || "Request failed. Please try again.";
};

export const request = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
