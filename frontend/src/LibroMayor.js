import React, { useEffect, useState } from 'react';
import './LibroMayor.css';

const obtenerLibroMayor = async () => {
    try {
        const respuesta = await fetch('https://sistema-contable-cqg4.onrender.com/api/libro-mayor');
        if (!respuesta.ok) throw new Error('Error al obtener el libro mayor');
        const data = await respuesta.json();
        return data.libro_mayor;
    } catch (error) {
        console.error(error);
        return {};
    }
};

const LibroMayor = () => {
    const [libro, setLibro] = useState({});

    useEffect(() => {
        obtenerLibroMayor().then(setLibro);
    }, []);

    const renderTablaMovimientos = (movimientos) => (
        <table className="libro-mayor-tabla">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Debe</th>
                    <th>Haber</th>
                    <th>Saldo</th>
                </tr>
            </thead>
            <tbody>
                {movimientos.map((mov, idx) => (
                    <tr key={idx}>
                        <td>{mov.fecha}</td>
                        <td>{mov.descripcion}</td>
                        <td>{mov.debe.toFixed(2)}</td>
                        <td>{mov.haber.toFixed(2)}</td>
                        <td>{mov.saldo.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="libro-mayor-container">
            <h1>Libro Mayor</h1>
            {Object.entries(libro).map(([codigo, cuenta]) => (
                <div className="cuenta-libro" key={codigo}>
                    <h2>{codigo} - {cuenta.descripcion}</h2>
                    {renderTablaMovimientos(cuenta.movimientos)}
                    <div className="saldo-final">
                        <strong>Saldo Final:</strong> {cuenta.saldo_final.toFixed(2)}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LibroMayor;
