import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './Especialidades.css';

const Especialidades = () => {
  const [isOpen, setIsOpen] = useState(false);

  const especialidades = [
    { nombre: 'Alergias e Inmunología', establecimientos: 2 },
    { nombre: 'Cardiología', establecimientos: 29 },
    { nombre: 'Cirugía Cabeza y Cuello', establecimientos: 11 },
    { nombre: 'Cirugía General', establecimientos: 24 },
    { nombre: 'Cirugia Pediatrica', establecimientos: 8 },
    { nombre: 'Cirugía Plástica', establecimientos: 8 },
    { nombre: 'Cirugía Tórax y Cardiovascular', establecimientos: 17 },
    { nombre: 'Dermatología', establecimientos: 28 },
    { nombre: 'Dermatologia Estética', establecimientos: 6 },
    { nombre: 'Dermatología Láser', establecimientos: 1 },
    { nombre: 'Endocrinología', establecimientos: 11 },
    { nombre: 'Flebología', establecimientos: 1 },
    { nombre: 'Gastroenterología', establecimientos: 24 },
    { nombre: 'Geriatría', establecimientos: 6 },
    { nombre: 'Ginecología', establecimientos: 29 },
    { nombre: 'Infertilidad', establecimientos: 2 },
    { nombre: 'Masoterapia', establecimientos: 2 },
    { nombre: 'Mastología', establecimientos: 3 },
    { nombre: 'Medicina Estética', establecimientos: 1 },
    { nombre: 'Medicina familiar y comunitaria', establecimientos: 1 },
    { nombre: 'Medicina fisica y rehabilitación', establecimientos: 20 },
    { nombre: 'Medicina General', establecimientos: 31 },
    { nombre: 'Medicina Interna', establecimientos: 16 },
    { nombre: 'Nefrología', establecimientos: 1 },
    { nombre: 'Neumología', establecimientos: 19 },
    { nombre: 'Neurocirugía', establecimientos: 5 },
    { nombre: 'Neurología', establecimientos: 22 },
    { nombre: 'Oftalmología', establecimientos: 25 },
    { nombre: 'Oncología', establecimientos: 5 },
    { nombre: 'Otorrinolaringología', establecimientos: 23 },
    { nombre: 'Pediatría', establecimientos: 19 },
    { nombre: 'Psiquiatría', establecimientos: 9 },
    { nombre: 'Reumatología', establecimientos: 18 },
    { nombre: 'Traumatología', establecimientos: 27 },
    { nombre: 'Urología', establecimientos: 25 },
  ];

  return (
    <section className="especialidades">
      <div className="especialidades-container">
        <div
          className="especialidades-header"
          onClick={() => setIsOpen(!isOpen)}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="especialidades-title">Nuestras Especialidades</h2>
            {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
          <p className="especialidades-subtitle">
            Contamos con una amplia gama de especialidades médicas para brindarte la mejor atención
          </p>
        </div>

        {isOpen && (
          <div className="especialidades-grid">
            {especialidades.map((especialidad, index) => (
              <div key={index} className="especialidad-card">
                <h3 className="especialidad-nombre">{especialidad.nombre}</h3>
                <div className="especialidad-info">
                  <span className="especialidad-numero">{especialidad.establecimientos}</span>
                  <span className="especialidad-label">
                    {especialidad.establecimientos === 1 ? 'establecimiento' : 'establecimientos'}
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

export default Especialidades;


