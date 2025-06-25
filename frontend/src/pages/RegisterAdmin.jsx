import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, Alert } from "@mui/material";
import axios from "axios";

const RegisterAdmin = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    try {
      // 1. Crear el usuario
      const resUsuario = await axios.post("http://localhost:8000/api/registro", {
        correo,
        password: contrasena,
        es_admin: true
      });

      // 2. Crear el administrador asociado
      await axios.post("http://localhost:8000/api/administradores/", {
        nombre,
        correo
      });

      setMensaje("Administrador registrado exitosamente");
      setCorreo("");
      setContrasena("");
      setNombre("");
    } catch (err) {
      setError(err.response?.data?.detail || "Error al registrar");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={4} p={3} boxShadow={3}>
        <Typography variant="h5" align="center" gutterBottom>
          Registro de Administrador
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {mensaje && <Alert severity="success">{mensaje}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre"
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
            Registrar
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default RegisterAdmin;
