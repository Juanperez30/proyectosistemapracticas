// pages/Register.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

const Register = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box mt={8} p={4} boxShadow={3} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Registrarse como:
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => navigate("/register/estudiante")}
        >
          Estudiante
        </Button>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => navigate("/register/empresa")}
        >
          Empresa
        </Button>
        <Button
          variant="contained"
          color="warning"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => navigate("/register/admin")}
        >
          Administrador
        </Button>
      </Box>
    </Container>
  );
};

export default Register;
