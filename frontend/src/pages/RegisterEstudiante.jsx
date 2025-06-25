import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import axios from 'axios';

const RegisterEstudiante = () => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [cedula, setCedula] = useState('');
  const [expedicionCedula, setExpedicionCedula] = useState('');
  const [semestre, setSemestre] = useState('');
  const [carrera, setCarrera] = useState('');


  const handleRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    // if (!correo.endsWith('@correo.uis.edu.co')) {
    //   setError('El correo debe ser institucional (@correo.uis.edu.co)');
    //   return;
    // }

    try {
      // Crear usuario
      await axios.post('http://localhost:8000/api/registro', {
        correo,
        password: contrasena,
        es_estudiante: true
      });

      // Crear estudiante
      await axios.post('http://localhost:8000/api/estudiantes/', {
        nombre,
        correo,        
        codigo,
        cedula,
        semestre,
        carrera
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
          Registro Estudiante
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {mensaje && <Alert severity="success">{mensaje}</Alert>}
        <form onSubmit={handleRegistro}>
          <TextField
            label="Nombre completo"
            fullWidth
            margin="normal"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <TextField
            label="Correo institucional"
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
          <TextField
            label="Código"
            fullWidth
            margin="normal"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <TextField
            label="Cédula"
            fullWidth
            margin="normal"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
          />
          {/* <TextField
            label="Expedición de cédula"
            fullWidth
            margin="normal"
            value={expedicionCedula}
            onChange={(e) => setExpedicionCedula(e.target.value)}
          /> */}
          <TextField
            label="Semestre"
            fullWidth
            margin="normal"
            value={semestre}
            onChange={(e) => setSemestre(e.target.value)}
          />
          <TextField
            label="Carrera"
            fullWidth
            margin="normal"
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
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

export default RegisterEstudiante;
