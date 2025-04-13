import React, { useState, useEffect } from 'react';
import './Reportes.css';

const obtenerReporteFinanciero = async () => {
    try {
        const respuesta = await fetch('http://localhost:5000/api/estado-financiero');
        if (!respuesta.ok) {
            throw new Error('No se pudo obtener el reporte');
        }
        const data = await respuesta.json();
        return data;
    } catch (error) {
        console.error('Error al obtener el reporte:', error);
        return { error: error.message };
    }
};

const ReporteFinanciero = () => {
    const [reporte, setReporte] = useState(null);

    useEffect(() => {
        obtenerReporteFinanciero().then((data) => {
            setReporte(data.estado_financiero);
        });
    }, []);

    if (!reporte) {
        return <div>Cargando...</div>;
    }

    const renderTable = (objeto) => {
        if (!objeto) {
            return <div>No hay datos disponibles</div>;
        }

        return (
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(objeto).map((key) => {
                            const value = objeto[key];
                            return (
                                <tr key={key}>
                                    <td>{key}</td>
                                    <td>{value}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="reportes-container">
            <div className="reporte-tarjeta">
                <div className="reporte-header">
                    <h1>Reporte de Estado de Situación Financiera</h1>
                </div>

                <div className="reportes-content">
                    {/* Activos */}
                    <div className="section">
                        <h2>Activo</h2>
                        <h3>Corriente</h3>
                        {renderTable(reporte["Estado de Situación Financiera"].Activo.Corriente)}

                        <h3>No Corriente</h3>
                        {renderTable(reporte["Estado de Situación Financiera"].Activo["No Corriente"])}
                    </div>

                    {/* Flecha */}
                    <div className="flecha">
                        <span>→</span>
                    </div>

                    {/* Pasivos y Patrimonio */}
                    <div className="section">
                        <h2>Pasivo</h2>
                        <h3>Corriente</h3>
                        {renderTable(reporte["Estado de Situación Financiera"].Pasivo.Corriente)}

                        <h3>No Corriente</h3>
                        {renderTable(reporte["Estado de Situación Financiera"].Pasivo["No Corriente"])}

                        <h3>Total Pasivo</h3>
                        {renderTable({ "Total Pasivo": reporte["Estado de Situación Financiera"].Pasivo["Total Pasivo"] })}

                        <h2>Patrimonio</h2>
                        {renderTable(reporte["Estado de Situación Financiera"].Patrimonio)}
                    </div>
                </div>

                {/* Fórmula central */}
                <div className="formula-container">
                    <div className="formula-text">Activo</div>
                    <div> = </div>
                    <div className="formula-text">Pasivo + Patrimonio</div>
                </div>

                <div className="formula-text">Totales</div>
                {renderTable(reporte["Estado de Situación Financiera"].Totales)}
            </div>
        </div>
    );
};

export default ReporteFinanciero;
