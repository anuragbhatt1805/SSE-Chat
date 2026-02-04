import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Set default axios header
  if (token) {
    axios.defaults.headers.common["x-auth-token"] = token;
  } else {
    delete axios.defaults.headers.common["x-auth-token"];
  }

  useEffect(() => {
    // Ideally user details are fetched here if token exists (e.g., /api/auth/me)
    // For MVP, we trust the token or decode it partially if needed.
    // Let's decode or just store token.
    if (token) {
      // Simple decode to check expiry or just assume logged in for MVP
      // In a real app, verify token with backend
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      username,
      password,
    });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    // Decode token or fetch user data if needed.
    // We'll set user state with username for UI display
    setUser({ username });
  };

  const signup = async (username, password) => {
    const res = await axios.post("http://localhost:5000/api/auth/signup", {
      username,
      password,
    });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser({ username });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, signup, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
