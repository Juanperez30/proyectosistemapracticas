import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedTipo = localStorage.getItem("tipo_usuario");

    if (storedToken && storedTipo) {
      setToken(storedToken);
      setTipoUsuario(storedTipo);
    }
  }, []);

  const login = (newToken, tipo) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("tipo_usuario", tipo);
    setToken(newToken);
    setTipoUsuario(tipo);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tipo_usuario");
    setToken(null);
    setTipoUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ token, tipoUsuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
