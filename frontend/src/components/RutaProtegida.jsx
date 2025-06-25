import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RutaProtegida = ({ children, tipoPermitido }) => {
  const { token, tipoUsuario } = useContext(AuthContext);

  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Si el tipo de usuario no coincide, redirigir también al login
  if (tipoUsuario !== tipoPermitido) {
    return <Navigate to="/login" />;
  }

  // Si está autenticado y tiene el tipo correcto, mostrar el contenido
  return children;
};

export default RutaProtegida;
