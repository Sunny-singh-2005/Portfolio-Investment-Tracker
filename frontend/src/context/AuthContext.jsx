import { createContext, useContext, useState, useCallback } from "react";
import { login as loginApi, register as registerApi } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ledger_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("ledger_token"));

  const persist = (data, username) => {
    const jwt = data.token || data.jwt || data.accessToken;
    localStorage.setItem("ledger_token", jwt);
    localStorage.setItem("ledger_user", JSON.stringify({ username }));
    setToken(jwt);
    setUser({ username });
  };

  const login = useCallback(async (username, password) => {
    const res = await loginApi({ username, password });
    persist(res.data, username);
  }, []);

  const register = useCallback(async (username, email, password) => {
    const res = await registerApi({ username, email, password });
    persist(res.data, username);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ledger_token");
    localStorage.removeItem("ledger_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
