import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './Servicios.css';

const Servicios = ({ isOpen, onToggle }) => {
  const servicios = [
    { nombre: 'Administración Hospitalaria', establecimientos: 5 },
    { nombre: 'Ambulancia 24 horas', establecimientos: 2 },
    { nombre: 'Anatomía Patológica', establecimientos: 24 },
    { nombre: 'Atención a domicilio', establecimientos: 1 },
    { nombre: 'Atención de seguros', establecimientos: 1 },
    { nombre: 'Banco de sangre', establecimientos: 1 },
    { nombre: 'Cámara Hiperbárica', establecimientos: 1 },
    { nombre: 'Central de esterilización', establecimientos: 3 },
    { nombre: 'Central obstétrico', establecimientos: 1 },
    { nombre: 'Crecimiento y Desarrollo – Cred', establecimientos: 3 },
    { nombre: 'Densitometría Ósea', establecimientos: 17 },
    { nombre: 'Ecografía', establecimientos: 31 },
    { nombre: 'Ecografia Ginecológica', establecimientos: 4 },
    { nombre: 'Ecografía Mamaria', establecimientos: 2 },
    { nombre: 'Ecografía Urológica', establecimientos: 3 },
    { nombre: 'Electroencefalograma', establecimientos: 3 },
    { nombre: 'Electromiografía', establecimientos: 3 },
    { nombre: 'Emergencias 24 horas', establecimientos: 1 },
    { nombre: 'Examen para brevete', establecimientos: 1 },
    { nombre: 'Farmacia', establecimientos: 20 },
    { nombre: 'Farmacia Dermatológica', establecimientos: 6 },
    { nombre: 'Hidroterapia', establecimientos: 2 },
    { nombre: 'Hospitalización', establecimientos: 1 },
    { nombre: 'Laboratorio Clínico', establecimientos: 33 },
    { nombre: 'Mamografía', establecimientos: 10 },
    { nombre: 'Medicina Estética', establecimientos: 2 },
    { nombre: 'Nutrición', establecimientos: 20 },
    { nombre: 'Obstetricia', establecimientos: 13 },
    { nombre: 'Odontología', establecimientos: 34 },
    { nombre: 'Odontopediatría', establecimientos: 1 },
    { nombre: 'Óptica', establecimientos: 6 },
    { nombre: 'Optometría', establecimientos: 3 },
    { nombre: 'Ortopedia', establecimientos: 1 },
    { nombre: 'Ozonoterapia', establecimientos: 5 },
    { nombre: 'Planta De Oxígeno', establecimientos: 4 },
    { nombre: 'Podología', establecimientos: 16 },
    { nombre: 'Psicología', establecimientos: 29 },
    { nombre: 'Radiología', establecimientos: 29 },
    { nombre: 'Resonancia Magnética', establecimientos: 18 },
    { nombre: 'Sala de operaciones', establecimientos: 2 },
    { nombre: 'Salud ocupacional', establecimientos: 1 },
    { nombre: 'Terapia Del Dolor Y Cuidados Paliativos', establecimientos: 2 },
    { nombre: 'Terapia Física Y Rehabilitación', establecimientos: 8 },
    { nombre: 'Tomografía', establecimientos: 21 },
    { nombre: 'Tópico', establecimientos: 28 },
    { nombre: 'Vacunatorio', establecimientos: 1 },
    { nombre: 'Venta de artículos de ortopedia', establecimientos: 2 },
  ];

  return (
    <section className="servicios" id="servicios">
      <div className="servicios-container">
        <div
          className="servicios-header"
          onClick={onToggle}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="servicios-title">Nuestros Servicios</h2>
            {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
          <p className="servicios-subtitle">
            Ofrecemos una amplia variedad de servicios médicos y de salud para cubrir todas tus necesidades
          </p>
        </div>

        {isOpen && (
          <div className="servicios-grid">
            {servicios.map((servicio, index) => (
              <div key={index} className="servicio-card">
                <h3 className="servicio-nombre">{servicio.nombre}</h3>
                <div className="servicio-info">
                  <span className="servicio-numero">{servicio.establecimientos}</span>
                  <span className="servicio-label">
                    {servicio.establecimientos === 1 ? 'establecimiento' : 'establecimientos'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Servicios;


