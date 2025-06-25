import React, {useEffect, useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Alert, Box } from '@mui/material';

const VerificarCuenta = () => {
  const [codigo, setCodigo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [contador, setContador] = useState(0);

  const correo = localStorage.getItem('correo_verificacion'); // se guarda al registrarse


  useEffect(() => {
    let intervalo;
    if (contador > 0) {
      intervalo = setInterval(() => {
        setContador((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [contador]);

  const reenviarCodigo = async () => {
    try {
        const correo = localStorage.getItem('correo_verificacion');
        await axios.post('http://localhost:8000/api/reenviar-codigo/', { correo });
        alert('Nuevo código enviado al correo');
        setContador(60); // Bloquear el botón por 60 segundos
    } catch (err) {
        alert(err.response?.data?.detail || 'Error al reenviar código');
    }
    };

  const handleVerificar = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/verificar-codigo/', {
        correo,
        codigo,
      });

      setMensaje(response.data.mensaje);
      setError('');

      // Limpia el localStorage y redirige al login
      localStorage.removeItem('correo_verificacion');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al verificar código');
      setMensaje('');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8} p={4} boxShadow={3}>
        <Typography variant="h5" gutterBottom>
          Verifica tu cuenta
        </Typography>
        <Typography variant="body1" gutterBottom>
          Ingresa el código que recibiste en tu correo institucional
        </Typography>

        {mensaje && <Alert severity="success">{mensaje}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Código de verificación"
          fullWidth
          margin="normal"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleVerificar}
          sx={{ mt: 2 }}
        >
          Verificar
        </Button>

        <button
            onClick={reenviarCodigo}
            disabled={contador > 0}
            style={{
            width: '100%',
            padding: 10,
            marginTop: 10,
            backgroundColor: contador > 0 ? '#ccc' : '#007bff',
            color: 'white',
            cursor: contador > 0 ? 'not-allowed' : 'pointer',
            }}
        >
        {contador > 0 ? `Reenviar en ${contador}s` : 'Reenviar código'}
      </button>
      </Box>
    </Container>
  );
};

export default VerificarCuenta;
