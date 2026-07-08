const AUTH_STORAGE_KEY = "teamsync_auth";

const canUseStorage = () => typeof window !== "undefined" && window.localStorage;

export const getStoredAuth = () => {
  if (!canUseStorage()) {
    return { token: "", user: null };
  }

  try {
    const storedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return storedAuth ? JSON.parse(storedAuth) : { token: "", user: null };
  } catch {
    return { token: "", user: null };
  }
};

export const setStoredAuth = (authData) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
};

export const clearStoredAuth = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getAuthToken = () => getStoredAuth().token || "";
