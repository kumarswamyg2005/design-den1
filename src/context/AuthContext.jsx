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
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
  const [logoutUserName, setLogoutUserName] = useState("");

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

      // Check if 2FA is required
      if (response.data.requires2FA) {
        return response.data; // Return early, don't set user yet
      }

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
    // Store user name before clearing for animation
    const userName = user?.name || user?.username || "User";
    console.log("Logout started, showing animation for:", userName);
    setLogoutUserName(userName);
    setShowLogoutAnimation(true);

    // Don't clear user immediately - let animation play first
    // User will be cleared when completeLogout is called
    try {
      await authAPI.logout();
      console.log("Logout API call completed");
    } catch (error) {
      console.error("Logout API error:", error);
    }
    // Note: Don't setUser(null) here - it will be done after animation
  };

  const completeLogout = () => {
    console.log("Animation complete, clearing user");
    setUser(null);
    setShowLogoutAnimation(false);
    setLogoutUserName("");
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
    showLogoutAnimation,
    logoutUserName,
    completeLogout,
    isAuthenticated: !!user,
    isCustomer: user?.role === "customer",
    isDesigner: user?.role === "designer",
    isManager: user?.role === "manager",
    isAdmin: user?.role === "admin",
    isDelivery: user?.role === "delivery",
  };

  // Don't render children until auth check is complete to prevent flash
  if (loading) {
    return (
      <AuthContext.Provider value={value}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <div style={{ textAlign: "center", color: "white" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "4px solid rgba(255,255,255,0.3)",
                borderTop: "4px solid white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1rem",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h2 style={{ margin: 0, fontWeight: 600 }}>DesignDen</h2>
            <p style={{ opacity: 0.8, marginTop: "0.5rem" }}>Loading...</p>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
