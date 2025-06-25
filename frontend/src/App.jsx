// src/App.jsx
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/dashboard/EstudianteDashboard";
import Lobby from './pages/Lobby';
import Navbar from './components/Navbar';
import RegisterEstudiante from './pages/RegisterEstudiante';
import Register from "./pages/Register";
import RegisterEmpresa from "./pages/RegisterEmpresa";
import RegisterAdmin from "./pages/RegisterAdmin";
import CrearPractica from "./pages/crearPractica";
import EmpresaDashboard from "./pages/dashboard/EmpresaDashboard";
import RutaProtegida from "./components/RutaProtegida";
import RedirigirSiAutenticado from "./components/RedirigirSiAutenticado";
import AprobarPracticas from "./pages/AprobarPracticas";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import InscripcionPractica from "./pages/InscripcionPractica";
import VerPostulacionesEmpresa from "./pages/VerPostulacionesEmpresa";
import AprobarPostulacionesAdmin from "./pages/AprobarPostulacionesAdmin";
import FormularioConvenio from "./pages/FormularioConvenio";
import ListaConveniosPendientes from "./pages/ListaConveniosPendientes";
import RevisarConvenio from "./pages/RevisarConvenio"
import EmpresasConConvenio from "./pages/EstudianteListarEmpresas"
import AdminEmpresasConConvenio from "./pages/AdminListarEmpresas"
import ListaEstudiantes from "./pages/AdminListarEstudiantes"
import EstudiantesEnPractica from "./pages/EstudiantesEnPractica"
import VerificarCuenta from "./pages/VerificarCuenta";
import RecuperarContrasena from "./pages/RecuperarContraseña";
import NuevaContrasena from "./pages/NuevaContraseña";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Lobby />} />

        {/* Login protegido para evitar acceso si ya está autenticado */}
        <Route 
          path="/login" 
          element={
            <RedirigirSiAutenticado>
              <LoginPage />
            </RedirigirSiAutenticado>
          } 
        />

        {/* Registros protegidos si ya hay sesión */}
        <Route 
          path="/register" 
          element={
            <RedirigirSiAutenticado>
              <Register />
            </RedirigirSiAutenticado>
          } 
        />
        <Route 
          path="/register/estudiante" 
          element={
            <RedirigirSiAutenticado>
              <RegisterEstudiante />
            </RedirigirSiAutenticado>
          } 
        />
        <Route 
          path="/register/empresa" 
          element={
            <RedirigirSiAutenticado>
              <RegisterEmpresa />
            </RedirigirSiAutenticado>
          } 
        />
        <Route 
          path="/register/admin" 
          element={
            <RedirigirSiAutenticado>
              <RegisterAdmin />
            </RedirigirSiAutenticado>
          } 
        />

        {/* Dashboards protegidos */}
        <Route 
          path="/dashboard-estudiante" 
          element={
            <RutaProtegida tipoPermitido="estudiante">
              <DashboardPage />
            </RutaProtegida>
          } 
        />
        <Route 
          path="/dashboard-empresa" 
          element={
            <RutaProtegida tipoPermitido="empresa">
              <EmpresaDashboard />
            </RutaProtegida>
          } 
        />
        <Route
          path="/dashboard-admin"
          element={
            <RutaProtegida tipoPermitido="admin">
              <AdminDashboard />
            </RutaProtegida>
          }
        />
        <Route 
          path="/crear-practica" 
          element={
            <RutaProtegida tipoPermitido="empresa">
              <CrearPractica />
            </RutaProtegida>
          } 
        />
        <Route 
          path="/aprobar-practicas" 
          element={
            <RutaProtegida tipoPermitido="admin">
              <AprobarPracticas />
            </RutaProtegida>
          }
        />
        <Route
          path="/ver-postulaciones"
          element={
            <RutaProtegida tipoPermitido="empresa">
              <VerPostulacionesEmpresa />
            </RutaProtegida>
          }
        />
        <Route
          path="/registro-convenios"
          element={
            <RutaProtegida tipoPermitido="empresa">
              <FormularioConvenio />
            </RutaProtegida>
          }
        />        
        <Route
          path="/admin/postulaciones"
          element={
            <RutaProtegida tipoPermitido="admin">
              <AprobarPostulacionesAdmin />
            </RutaProtegida>
          }
        />
        <Route path="/admin/lista-convenios" element={
          <RutaProtegida tipoPermitido="admin">
            <ListaConveniosPendientes />
          </RutaProtegida>
          } 
        />
        <Route path="/admin/revisar-convenio/:empresa_id" element={
          <RutaProtegida tipoPermitido="admin">
            <RevisarConvenio />
          </RutaProtegida>
          } 
        />
        <Route path="/estudiante/listar-empresas" element={
          <RutaProtegida tipoPermitido="estudiante">
            <EmpresasConConvenio />
          </RutaProtegida>
          } 
        />
        <Route path="/admin/listar-empresas" element={
          <RutaProtegida tipoPermitido="admin">
            <AdminEmpresasConConvenio />
          </RutaProtegida>
          } 
        />
        <Route path="/admin/listar-estudiantes" element={
          <RutaProtegida tipoPermitido="admin">
            <ListaEstudiantes />
          </RutaProtegida>
          } 
        />        
        <Route path="/estudiante/estudiantes-en-practica" element={
          <RutaProtegida tipoPermitido="estudiante">
            <EstudiantesEnPractica />
          </RutaProtegida>
          } 
        />
        <Route path="/estudiante/verificar-cuenta" element={
          <RutaProtegida tipoPermitido="estudiante">
            <VerificarCuenta />
          </RutaProtegida>
          } 
        />             
        <Route path="/empresa/verificar-cuenta" element={
          <RutaProtegida tipoPermitido="empresa">
            <VerificarCuenta />
          </RutaProtegida>
          } 
        />              
        <Route
          path="/inscripcion-practica"
          element={
            <RutaProtegida tipoPermitido="estudiante">
              <InscripcionPractica />
            </RutaProtegida>
          }
        />
          <Route
          path="/recuperar-contrasena"
          element={
              <RecuperarContrasena />
          }
        />
        <Route
          path="nueva-contrasena"
          element={
              <NuevaContrasena />
          }
        />


      </Routes>
    </>
  );
}

export default App;