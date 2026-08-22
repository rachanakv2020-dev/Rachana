import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("ff_token");
    const storedUser = localStorage.getItem("ff_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setReady(true);
  }, []);

  function persist(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("ff_token", nextToken);
    localStorage.setItem("ff_user", JSON.stringify(nextUser));
  }

  async function login(email, password) {
    const data = await api.login({ email, password });
    persist(data.token, data.user);
    return data.user;
  }

  async function signup(name, email, password) {
    const data = await api.signup({ name, email, password });
    persist(data.token, data.user);
    return data.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("ff_token");
    localStorage.removeItem("ff_user");
  }

  return (
    <AuthContext.Provider value={{ user, token, ready, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
