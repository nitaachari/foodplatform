import { createContext, useContext, useEffect, useState } from "react";
import {
  getMeRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
} from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "checking" avoids a login-page flash while we ask the server whether
  // the httpOnly cookie from a previous session is still valid.
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getMeRequest()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const register = async (payload) => {
    const data = await registerRequest(payload);
    setUser(data.user);
    return data.user;
  };

  const login = async (payload) => {
    const data = await loginRequest(payload);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, checking, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
