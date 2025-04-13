import React, { useEffect, useState } from 'react';
import FormularioOperacion from './FormularioOperacion';
import ResumenOperaciones from './ResumenOperaciones';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReporteFinanciero from './ReporteFinanciero';
import ReporteResultado from './ReporteResultado'; // Se cambió el nombre aquí
import './App.css';



const App = () => {
  const [operaciones, setOperaciones] = useState([]);
  const [reporteSituacion, setReporteSituacion] = useState(null); // Reporte de Situación Financiera
  const [reporteResultados, setReporteResultados] = useState(null); // Reporte de Estado de Resultados

  // Cargar operaciones
  const cargarOperaciones = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/operaciones');
      setOperaciones(response.data);
    } catch (error) {
      console.error('Error al cargar operaciones:', error);
      alert('No se pudieron cargar las operaciones');
    }
  };

  // Cargar el reporte de Estado de Situación Financiera
  const cargarReporteSituacion = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/estado-situacion');
      setReporteSituacion(response.data.estado_financiero); // Se asume que la estructura es 'estado_financiero'
    } catch (error) {
      console.error('Error al cargar el reporte de situación:', error);
    }
  };

  // Cargar el reporte de Estado de Resultados
  const cargarReporteResultados = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/estado-resultados');
      setReporteResultados(response.data.estado_resultado); // Se asume que la estructura es 'estado_resultado'
    } catch (error) {
      console.error('Error al cargar el reporte de resultados:', error);
      alert('No se pudo cargar el reporte de resultados');
    }
  };

  useEffect(() => {
    cargarOperaciones();
    cargarReporteSituacion(); // Cargar reporte de situación financiera
    cargarReporteResultados(); // Cargar reporte de resultados
  }, []);

  return (
    <Router>
      <div>
        <h1>Bienvenido a la Aplicación Contable</h1>
  
        {/* Botones para navegar */}
        <div className="nav-buttons">
          <Link to="/reporte-situacion">
            <button>Ver Reporte de Situación Financiera</button>
          </Link>
          <Link to="/reporte-resultados">
            <button>Ver Reporte de Estado de Resultados</button>
          </Link>
          <button
            onClick={() => window.location.href = 'http://localhost:3000'}
           className="boton-regresar"
          >
          Volver al Inicio
          </button>

        </div>
        
        <Routes>
          <Route
            path="/"
            element={
              <div className="main-wrapper">
                <div className="form-container">
                  <FormularioOperacion onOperacionExitosa={cargarOperaciones} />
                </div>
                <div className="resumen-operaciones-container">
                  <ResumenOperaciones operacionesIniciales={operaciones} />
                </div>
              </div>
            }
          />
          <Route
            path="/reporte-situacion"
            element={<ReporteFinanciero reporte={reporteSituacion} />}
          />
          <Route
            path="/reporte-resultados"
            element={<ReporteResultado reporte={reporteResultados} />}
          />
        </Routes>
      </div>
    </Router>
  );
  
};

export default App;
