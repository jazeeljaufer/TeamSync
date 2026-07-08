import React, { createContext, useCallback, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { clearStoredAuth, getStoredAuth, setStoredAuth } from "../utils/storage";

export const AuthContext = createContext(null);

const createSession = (response) => ({
  token: response?.token || "",
  user: response?.user || null,
});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(getStoredAuth);

  const saveSession = useCallback((response) => {
    const session = createSession(response);
    setAuth(session);
    setStoredAuth(session);
    return response;
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await authService.login(credentials);
      return saveSession(response);
    },
    [saveSession]
  );

  const register = useCallback(
    async (details) => {
      const response = await authService.register(details);
      return response;
    },
    []
  );
  
  const verifyRegistration = useCallback(
    async (details) => {
      const response = await authService.verifyRegistration(details);
      return saveSession(response);
    },
    [saveSession]
  );

  const logout = useCallback(() => {
    setAuth({ token: "", user: null });
    clearStoredAuth();
  }, []);

  const updateProfile = useCallback(
    async (details) => {
      const response = await authService.updateProfile(details);
      if (response?.success && response?.user) {
        setAuth(prev => {
          const updated = { ...prev, user: { ...prev.user, ...response.user } };
          setStoredAuth(updated);
          return updated;
        });
      }
      return response;
    },
    []
  );

  const value = useMemo(
    () => ({
      ...auth,
      isAuthenticated: Boolean(auth.token),
      login,
      register,
      verifyRegistration,
      logout,
      forgotPassword: authService.forgotPassword,
      resetPassword: authService.resetPassword,
      resendOTP: authService.resendOTP,
      getProfile: authService.getProfile,
      updateProfile,
    }),
    [auth, login, register, verifyRegistration, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
