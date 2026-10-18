import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("lungsense_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api.me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("lungsense_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await api.login({ email, password });
    localStorage.setItem("lungsense_token", data.access_token);
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    await api.register({ name, email, password });
    return login(email, password);
  }

  function logout() {
    localStorage.removeItem("lungsense_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
