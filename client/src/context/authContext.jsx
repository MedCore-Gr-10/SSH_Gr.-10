import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const safeParse = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() =>
    safeParse(localStorage.getItem("user")),
  );

  const login = (data) => {
    if (!data?.token) return false;

    const authUser =
      data.user ??
      (data.role
        ? {
            id: data.user_id ?? data.id,
            role: data.role,
            hospital_id: data.hospital_id ?? null,
          }
        : null);

    if (!authUser?.role) return false;

    setToken(data.token);
    setUser(authUser);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(authUser));

    return true;
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
      setUser(safeParse(localStorage.getItem("user")));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
