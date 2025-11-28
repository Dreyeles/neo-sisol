import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import LogoutIcon from './LogoutIcon';

const MOCK_RESULTADOS = [
  { id: 1, examen: 'Hemograma Completo', servicio: 'Laboratorio Central', fecha: '2024-01-12', fechaFormatted: '12 de Enero, 2024', tipo: 'pdf' },
  { id: 2, examen: 'Rayos X de Tórax', servicio: 'Imagenología', fecha: '2024-01-10', fechaFormatted: '10 de Enero, 2024', tipo: 'img' },
  { id: 3, examen: 'Prueba de Glucosa', servicio: 'Laboratorio Central', fecha: '2024-01-05', fechaFormatted: '05 de Enero, 2024', tipo: 'pdf' },
];

const MOCK_HISTORIAL = [
  { id: 1, especialidad: 'Consulta General', doctor: 'Dr. Juan Pérez', fecha: '2024-01-10', fechaFormatted: '10 de Enero, 2024', status: 'completed' },
  { id: 2, especialidad: 'Control Cardiológico', doctor: 'Dra. María García', fecha: '2024-01-05', fechaFormatted: '5 de Enero, 2024', status: 'completed' },
  { id: 3, especialidad: 'Dermatología', doctor: 'Dr. Luis Ana', fecha: '2023-12-20', fechaFormatted: '20 de Diciembre, 2023', status: 'completed' },
];

const Dashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('citas');
  const [especialidades, setEspecialidades] = useState([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(true);

  // Filtros Resultados
  const [filterDate, setFilterDate] = useState('');
  const [filterService, setFilterService] = useState('');

  // Filtros Historial
  const [filterHistorialDate, setFilterHistorialDate] = useState('');
  const [filterHistorialSpecialty, setFilterHistorialSpecialty] = useState('');

  // Cargar especialidades desde la API
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/especialidades');
        const data = await response.json();

        if (data.status === 'OK') {
          setEspecialidades(data.data);
        }
      } catch (error) {
        console.error('Error al cargar especialidades:', error);
      } finally {
        setLoadingEspecialidades(false);
      }
    };

    fetchEspecialidades();
  }, []);

  const filteredResultados = MOCK_RESULTADOS.filter(item => {
    const matchDate = filterDate ? item.fecha === filterDate : true;
    const matchService = filterService ? item.servicio === filterService : true;
    return matchDate && matchService;
  });

  const filteredHistorial = MOCK_HISTORIAL.filter(item => {
    const matchDate = filterHistorialDate ? item.fecha === filterHistorialDate : true;
    const matchSpecialty = filterHistorialSpecialty ? item.especialidad === filterHistorialSpecialty : true;
    return matchDate && matchSpecialty;
  });

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src="/logo.svg" alt="Neo SISOL" className="sidebar-logo" />
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === 'citas' ? 'active' : ''}`}
            onClick={() => setActiveSection('citas')}
          >
            📅 Mis Citas
          </button>
          <button
            className={`nav-item ${activeSection === 'agendar' ? 'active' : ''}`}
            onClick={() => setActiveSection('agendar')}
          >
            ➕ Agendar Cita
          </button>
          <button
            className={`nav-item ${activeSection === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveSection('perfil')}
          >
            👤 Mi Perfil
          </button>
          <button
            className={`nav-item ${activeSection === 'historial' ? 'active' : ''}`}
            onClick={() => setActiveSection('historial')}
          >
            📋 Historial
          </button>
          <button
            className={`nav-item ${activeSection === 'resultados' ? 'active' : ''}`}
            onClick={() => setActiveSection('resultados')}
          >
            🔬 Resultados
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-button" onClick={onLogout}>
            <LogoutIcon size={18} /> Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>Bienvenido, {user?.nombre || 'Usuario'}</h1>
            <p>Panel de Paciente</p>
          </div>
        </header>

        <main className="dashboard-main">
          {activeSection === 'citas' && (
            <div className="section-content">
              <h2>Mis Próximas Citas</h2>
              <div className="citas-list">
                <div className="cita-card">
                  <div className="cita-info">
                    <h3>Consulta General</h3>
                    <p>Dr. Juan Pérez</p>
                    <p className="cita-fecha">📅 15 de Enero, 2024 - 10:00 AM</p>
                  </div>
                  <div className="cita-actions">
                    <button className="btn-secondary">Ver Detalles</button>
                    <button className="btn-danger">Cancelar</button>
                  </div>
                </div>
                <p className="empty-state">No hay más citas programadas</p>
              </div>
            </div>
          )}

          {activeSection === 'agendar' && (
            <div className="section-content">
              <h2>Agendar Nueva Cita</h2>
              <form className="agendar-form">
                <div className="form-group">
                  <label>Especialidad</label>
                  <select>
                    <option value="">Seleccione una especialidad</option>
                    {loadingEspecialidades ? (
                      <option disabled>Cargando especialidades...</option>
                    ) : (
                      especialidades.map(esp => (
                        <option key={esp.id_especialidad} value={esp.id_especialidad}>
                          {esp.nombre}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>Médico</label>
                  <select>
                    <option>Seleccione un médico</option>
                    <option>Dr. Juan Pérez</option>
                    <option>Dra. María García</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha</label>
                  <input type="date" />
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <input type="time" />
                </div>
                <div className="form-group">
                  <label>Motivo de la consulta</label>
                  <textarea rows="4" placeholder="Describa el motivo de su consulta..."></textarea>
                </div>
                <button type="submit" className="btn-primary">Agendar Cita</button>
              </form>
            </div>
          )}

          {activeSection === 'perfil' && (
            <div className="section-content">
              <h2>Mi Perfil</h2>
              <div className="perfil-card">
                <div className="perfil-header">
                  <div className="avatar">👤</div>
                  <h3>{user?.nombre || 'Usuario'}</h3>
                </div>
                <div className="perfil-info">
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{user?.email || 'usuario@email.com'}</span>
                  </div>
                  <div className="info-item">
                    <label>Teléfono:</label>
                    <span>+51 999 999 999</span>
                  </div>
                  <div className="info-item">
                    <label>DNI:</label>
                    <span>12345678</span>
                  </div>
                  <div className="info-item">
                    <label>Fecha de Nacimiento:</label>
                    <span>01/01/1990</span>
                  </div>
                </div>
                <button className="btn-primary">Editar Perfil</button>
              </div>
            </div>
          )}

          {activeSection === 'historial' && (
            <div className="section-content">
              <h2>Historial de Citas</h2>

              <div className="filters-container" style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Filtrar por Fecha</label>
                  <input
                    type="date"
                    value={filterHistorialDate}
                    onChange={(e) => setFilterHistorialDate(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Filtrar por Especialidad</label>
                  <select
                    value={filterHistorialSpecialty}
                    onChange={(e) => setFilterHistorialSpecialty(e.target.value)}
                  >
                    <option value="">Todas las especialidades</option>
                    <option value="Consulta General">Consulta General</option>
                    <option value="Control Cardiológico">Control Cardiológico</option>
                    <option value="Dermatología">Dermatología</option>
                  </select>
                </div>
              </div>

              <div className="historial-list">
                {filteredHistorial.map(cita => (
                  <div className="historial-item" key={cita.id}>
                    <div className="historial-info">
                      <h3>{cita.especialidad}</h3>
                      <p>{cita.doctor}</p>
                      <p className="historial-fecha">📅 {cita.fechaFormatted}</p>
                    </div>
                    <div className="historial-actions">
                      <span className="historial-status completed">Completada</span>
                      <button className="btn-secondary btn-sm" style={{ marginTop: '8px' }}>⬇️ Descargar Resultados</button>
                    </div>
                  </div>
                ))}

                {filteredHistorial.length === 0 && (
                  <div className="empty-state">
                    <p>No se encontraron citas con los filtros seleccionados.</p>
                    {(filterHistorialDate || filterHistorialSpecialty) && (
                      <button
                        className="btn-secondary"
                        onClick={() => { setFilterHistorialDate(''); setFilterHistorialSpecialty(''); }}
                        style={{ marginTop: '10px' }}
                      >
                        Limpiar Filtros
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'resultados' && (
            <div className="section-content">
              <h2>Resultados de Exámenes</h2>

              <div className="filters-container" style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Filtrar por Fecha</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Filtrar por Servicio</label>
                  <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                  >
                    <option value="">Todos los servicios</option>
                    <option value="Laboratorio Central">Laboratorio Central</option>
                    <option value="Imagenología">Imagenología</option>
                  </select>
                </div>
              </div>

              <div className="historial-list">
                {filteredResultados.map(resultado => (
                  <div className="historial-item" key={resultado.id}>
                    <div className="historial-info">
                      <h3>{resultado.examen}</h3>
                      <p>{resultado.servicio}</p>
                      <p className="historial-fecha">📅 {resultado.fechaFormatted}</p>
                    </div>
                    <button className="btn-secondary">
                      ⬇️ Descargar {resultado.tipo === 'pdf' ? 'PDF' : 'Imagen'}
                    </button>
                  </div>
                ))}

                {filteredResultados.length === 0 && (
                  <div className="empty-state">
                    <p>No se encontraron resultados con los filtros seleccionados.</p>
                    {(filterDate || filterService) && (
                      <button
                        className="btn-secondary"
                        onClick={() => { setFilterDate(''); setFilterService(''); }}
                        style={{ marginTop: '10px' }}
                      >
                        Limpiar Filtros
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

