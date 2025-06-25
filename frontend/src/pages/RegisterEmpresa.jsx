import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import axios from 'axios';

const RegisterEmpresa = () => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    try {
      // Crear usuario
      await axios.post('http://localhost:8000/api/registro', {
        correo,
        password: contrasena,
        es_empresa: true
      });

      // Crear empresas
      await axios.post('http://localhost:8000/api/empresas/', {
        nombre,
        correo
      });
      localStorage.setItem('correo_verificacion', correo);
      window.location.href = '/login';
      // setMensaje('Registro exitoso. Ahora puedes iniciar sesión.');
      // setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8} p={4} boxShadow={3}>
        <Typography variant="h4" align="center" gutterBottom>
          Registro Empresa
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {mensaje && <Alert severity="success">{mensaje}</Alert>}
        <form onSubmit={handleRegistro}>
          <TextField
            label="Nombre de la empresa"
            fullWidth
            margin="normal"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <TextField
            label="Correo"
            fullWidth
            margin="normal"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Registrarse
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default RegisterEmpresa;
