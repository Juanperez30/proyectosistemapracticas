import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Alert,
} from "@mui/material";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

// const reenviarCorreoVerificacion = async () => {
//   try {
//     await axios.post('http://localhost:8000/api/reenviar-verificacion', {
//       correo: usuarioCorreo,
//     });
//     alert("Se envió el enlace nuevamente");
//   } catch (err) {
//     alert("Error al reenviar");
//   }
// };


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new URLSearchParams();
    formData.append("username", correo);
    formData.append("password", contrasena);

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body:  new URLSearchParams({
          username: correo,
          password: contrasena,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.access_token, data.tipo); // "tipo" viene del backend

        // Redirige según el tipo de usuario
        if (data.tipo === "estudiante") {
          navigate("/dashboard-estudiante");
        } else if (data.tipo === "empresa") {
          navigate("/dashboard-empresa");
        } else if (data.tipo === "admin") {
          navigate("/dashboard-admin");
        } else {
          setError("Tipo de usuario desconocido");
        }
      } else {
        const errData = await response.json();
        setError(errData.detail || "Error al iniciar sesión");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8} p={4} boxShadow={3}>
        <Typography variant="h4" align="center" gutterBottom>
          Iniciar Sesión
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleLogin}>
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
            Ingresar
          </Button>

          <Button
            variant="text"
            color="primary"
            onClick={() => navigate('/recuperar-contrasena')}
          >
            ¿Olvidaste tu contraseña?
          </Button>


        </form>
      </Box>
    </Container>
  );
}

export default Login;
