import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Grid, Box } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CrearPractica = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [salario, setSalario] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [fechaCierre, setFechaCierre] = useState('');
  const [limiteEstudiantes, setLimiteEstudiantes] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const limite = parseInt(limiteEstudiantes);
    if (isNaN(limite) || limite <= 0) {
      setError('El límite de estudiantes debe ser un número válido mayor que cero.');
      return;
    }

    const practica = {
      nombre,
      descripcion,
      salario: parseFloat(salario),
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      fecha_cierre: fechaCierre,
      limite_estudiantes: parseInt(limite),
    };

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/practicas/', practica, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        navigate('/dashboard-empresa');
      }
    } catch (error) {

      setError('Hubo un problema al crear la práctica.');
      console.error(error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Crear Nueva Práctica
        </Typography>

        {error && (
          <Typography color="error" variant="body2" gutterBottom>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre de la práctica"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Salario"
                type="number"
                value={salario}
                onChange={(e) => setSalario(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Límite de estudiantes"
                type="number"
                value={limiteEstudiantes}
                onChange={(e) => setLimiteEstudiantes(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fecha de cierre"
                type="date"
                value={fechaCierre}
                onChange={(e) => setFechaCierre(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
              >
                Crear Práctica
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default CrearPractica;
