import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await authAPI.checkSession();
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log("AuthContext: Calling login API...");
      const response = await authAPI.login(credentials);
      console.log("AuthContext: Login response:", response.data);

      if (response.data.user) {
        setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      throw error;
    }
  };

  const signup = async (data) => {
    const response = await authAPI.signup(data);
    if (response.data.user) {
      setUser(response.data.user);
    }
    return response.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    setUser((prevUser) => ({ ...prevUser, ...userData }));
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    checkSession,
    isAuthenticated: !!user,
    isCustomer: user?.role === "customer",
    isDesigner: user?.role === "designer",
    isManager: user?.role === "manager",
    isAdmin: user?.role === "admin",
    isDelivery: user?.role === "delivery",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
