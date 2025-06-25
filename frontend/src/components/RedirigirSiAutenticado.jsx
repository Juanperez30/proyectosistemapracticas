import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RedirigirSiAutenticado = ({ children }) => {
  const { token, tipoUsuario } = useContext(AuthContext);

  if (token && tipoUsuario) {
    if (tipoUsuario === 'empresa') return <Navigate to="/dashboard-empresa" />;
    if (tipoUsuario === 'estudiante') return <Navigate to="/dashboard-estudiante" />;
    if (tipoUsuario === 'admin') return <Navigate to="/dashboard-admin" />;
  }

  return children;
};

export default RedirigirSiAutenticado;
