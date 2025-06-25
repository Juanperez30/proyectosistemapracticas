import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/usuarios/me')  // Esta ruta debes implementarla en backend
        .then(res => setUsuario(res.data))
        .catch(() => logout());
    }
  }, []);

  const login = async (correo, password) => {
    const response = await api.post('/login', { correo, password });
    localStorage.setItem('token', response.data.access_token);
    setUsuario(response.data.user);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
