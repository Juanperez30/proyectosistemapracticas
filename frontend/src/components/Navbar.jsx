// components/Navbar.js
import React, { useContext } from 'react';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { token, tipo, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInicio = () => {
    if (token) {
      if (tipo === 'estudiante') navigate('/dashboard-estudiante');
      else if (tipo === 'empresa') navigate('/dashboard-empresa');
      else if (tipo === 'admin') navigate('/dashboard-admin');
    } else {
      navigate('/');
    }
  };

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }} onClick={handleInicio} style={{ cursor: 'pointer' }}>
          Prácticas UIS
        </Typography>
        <Button color="inherit" onClick={handleInicio}>Inicio</Button>
        {!token ? (
          <>
            <Button color="inherit" onClick={handleLogin}>Iniciar sesión</Button>
            <Button color="inherit" onClick={handleRegister}>Registrarse</Button>
          </>
        ) : (
          <Button color="inherit" onClick={handleLogout}>Cerrar sesión</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
