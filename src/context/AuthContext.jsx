import { createContext, useContext, useState, useCallback } from "react";

export const AuthContext = createContext(null);

const USER_SESSION_KEY = "loggedInUser";


const getStoredUser = () => {
  try {
    const saved = localStorage.getItem(USER_SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem(USER_SESSION_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
 
  const [user, setUser] = useState(getStoredUser);

  // loading is always false now — user is known synchronously
  const login = useCallback((email, name) => {
    const userData = { email, name };
    setUser(userData);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);