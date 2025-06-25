import React, { useState } from 'react';
import { TextField, Button, Container, Box, Typography, Alert } from '@mui/material';
import axios from 'axios';

const RecuperarContrasena = () => {
  const [correo, setCorreo] = useState('');
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const enviarCorreo = async () => {
    setError('');
    setMensaje('');
    try {
      await axios.post('http://localhost:8000/api/recuperar-contrasena/', { correo });
      setCodigoEnviado(true);
      localStorage.setItem('correo_recuperacion', correo);
      setMensaje('Código enviado. Por favor ingrésalo abajo.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al enviar el código');
    }
  };

  const verificarCodigo = async () => {
    setError('');
    try {
      const res = await axios.post('http://localhost:8000/api/verificar-codigo-contrasena/', {
        correo,
        codigo,
      });
      if (res.data.validado) {
        localStorage.setItem('codigo_validado', 'true');
        // navigate('/nueva-contrasena');
        window.location.href = '/nueva-contrasena';
      } else {
        setError('Código incorrecto');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al verificar código');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5} p={4} boxShadow={3}>
        <Typography variant="h5" align="center" gutterBottom>
          Recuperar Contraseña
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {mensaje && <Alert severity="success">{mensaje}</Alert>}

        <TextField
          label="Correo"
          fullWidth
          margin="normal"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          disabled={codigoEnviado}
        />

        {!codigoEnviado ? (
          <Button variant="contained" fullWidth onClick={enviarCorreo}>
            Enviar Código
          </Button>
        ) : (
          <>
            <TextField
              label="Código de Verificación"
              fullWidth
              margin="normal"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
            <Button variant="contained" fullWidth onClick={verificarCodigo}>
              Verificar Código
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default RecuperarContrasena;
