import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ReporteResultado.css';

const ReporteResultado = () => {
  const [reporte, setReporte] = useState(null);

  useEffect(() => {
    const obtenerReporte = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/estado-resultados');
        setReporte(response.data['Estado de Resultados']);
      } catch (error) {
        console.error('Error al cargar el reporte:', error);
      }
    };

    obtenerReporte();
  }, []);

  if (!reporte) {
    return <p className="loading-text">Cargando el reporte...</p>;
  }

  return (
    
    <div className="resultado-container">
      
      <div className="resultado-tarjeta">
        <h2 className="resultado-header">Reporte de Resultados</h2>
        <table className="resultado-tabla">
          <tbody>
            <tr className="venta-destacada">
              <td>Ventas Netas</td>
              <td>{reporte['Ventas (70)']}</td>
            </tr>
            <tr>
              <td>Costos de Ventas (69)</td>
              <td>{reporte['Costos de Ventas (69)']}</td>
            </tr>
            <tr className="utilidad-bruta">
              <td>Utilidad Bruta</td>
              <td>{reporte['Utilidad Bruta']}</td>
            </tr>
            <tr>
              <td>Gastos Operativos</td>
              <td>{reporte['Gastos Operativos']['Total Gastos Operativos']}</td>
            </tr>
            <tr className="utilidad-operativa">
              <td>Utilidad Operativa</td>
              <td>{reporte['Utilidad Operativa']}</td>
            </tr>
            <tr>
              <td>Otros Gastos (66)</td>
              <td>{reporte['Otros Gastos (66)']}</td>
            </tr>
            <tr>
              <td>Otros Ingresos (75)</td>
              <td>{reporte['Otros Ingresos (75)']}</td>
            </tr>
            <tr className="utilidad-antes-impuestos">
              <td>Utilidad Antes de Impuestos</td>
              <td>{reporte['Utilidad Antes de Impuestos']}</td>
            </tr>
            <tr>
              <td>Impuesto a la Renta (88)</td>
              <td>{reporte['Impuesto a la Renta (88)']}</td>
            </tr>
            <tr className="utilidad-neta">
              <td><strong>Utilidad Neta del Periodo</strong></td>
              <td><strong>{reporte['Utilidad Neta del Periodo']}</strong></td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default ReporteResultado;
