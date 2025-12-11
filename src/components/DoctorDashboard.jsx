import React, { useState, useEffect } from 'react';
import './Dashboard.css'; // Reusing existing dashboard styles
import './DoctorDashboard.css'; // Doctor-specific styles
import LogoutIcon from './LogoutIcon';

const DoctorDashboard = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState('agenda');
    const [citas, setCitas] = useState([]);
    const [loadingCitas, setLoadingCitas] = useState(false);

    // Cargar citas del médico
    const fetchCitas = async () => {
        if (!user?.id_medico) return;
        setLoadingCitas(true);
        try {
            const response = await fetch(`http://localhost:5000/api/citas/medico/${user.id_medico}`);
            const data = await response.json();
            if (data.status === 'OK') {
                setCitas(data.data);
            }
        } catch (error) {
            console.error('Error al cargar citas:', error);
        } finally {
            setLoadingCitas(false);
        }
    };

    const [pacientes, setPacientes] = useState([]);
    const [loadingPacientes, setLoadingPacientes] = useState(false);

    // Cargar pacientes del médico
    const fetchPacientes = async () => {
        if (!user?.id_medico) return;
        setLoadingPacientes(true);
        try {
            const response = await fetch(`http://localhost:5000/api/medicos/${user.id_medico}/pacientes`);
            const data = await response.json();
            if (data.status === 'OK') {
                setPacientes(data.data);
            }
        } catch (error) {
            console.error('Error al cargar pacientes:', error);
        } finally {
            setLoadingPacientes(false);
        }
    };

    useEffect(() => {
        if (activeSection === 'agenda') {
            fetchCitas();
        } else if (activeSection === 'pacientes') {
            fetchPacientes();
        }
    }, [user, activeSection]);

    // Filtrar citas para el día de hoy (o todas para demostración)
    // En un sistema real usaríamos fecha actual, pero aquí mostramos todas las programadas
    const agendaDelDia = citas.filter(c => c.estado === 'programada' || c.estado === 'confirmada');

    const [showConsultaModal, setShowConsultaModal] = useState(false);
    const [consultaActual, setConsultaActual] = useState(null);
    const [consultaStep, setConsultaStep] = useState(1); // 1: Datos/Triaje, 2: Consulta, 3: Tratamiento
    const [consultaForm, setConsultaForm] = useState({
        peso: '',
        talla: '',
        presion_arterial: '',
        temperatura: '',
        grupo_sanguineo: '',
        alergias: '',
        motivo_consulta: '',
        sintomas: '',
        diagnostico: '',
        observaciones: '',
        tratamiento: '',
        receta_medica: '',
        proxima_cita: ''
    });

    const handleIniciarConsulta = (cita) => {
        setConsultaActual(cita);
        setConsultaForm(prev => ({
            ...prev,
            motivo_consulta: cita.motivo_consulta || '',
            // Resetear otros campos
            peso: '', talla: '', presion_arterial: '', temperatura: '',
            grupo_sanguineo: '', alergias: '',
            sintomas: '', diagnostico: '', observaciones: '',
            tratamiento: '', receta_medica: '', proxima_cita: ''
        }));
        setConsultaStep(1);
        setShowConsultaModal(true);
    };

    const handleVerHistoria = () => {
        alert("El paciente no cuenta con una historia clínica registrada en el sistema aún.");
    };

    const [showHistorialModal, setShowHistorialModal] = useState(false);
    const [historialData, setHistorialData] = useState([]);

    const handleVerHistorialPaciente = async (id_paciente) => {
        try {
            const response = await fetch(`http://localhost:5000/api/atencion/historial/${id_paciente}`);
            const data = await response.json();
            if (data.status === 'OK') {
                setHistorialData(data.data);
                setShowHistorialModal(true);
            } else {
                alert('No se pudo cargar el historial: ' + data.message);
            }
        } catch (error) {
            console.error('Error al cargar historial:', error);
            alert('Error de conexión al cargar historial');
        }
    };

    // Estados para búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const handleSearchPacientes = async () => {
        setLoadingSearch(true);
        try {
            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('q', searchTerm);
            if (searchDate) queryParams.append('fecha', searchDate);

            const response = await fetch(`http://localhost:5000/api/pacientes/buscar?${queryParams}`);
            const data = await response.json();

            if (data.status === 'OK') {
                setSearchResults(data.data);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
            alert('Error al buscar pacientes');
        } finally {
            setLoadingSearch(false);
        }
    };

    const [showPerfilMedicoModal, setShowPerfilMedicoModal] = useState(false);
    const [perfilMedicoData, setPerfilMedicoData] = useState(null);

    const handleVerPerfilMedico = async (id_paciente) => {
        try {
            const response = await fetch(`http://localhost:5000/api/pacientes/perfil-medico/${id_paciente}`);
            const data = await response.json();

            if (data.status === 'OK') {
                setPerfilMedicoData(data.data);
                setShowPerfilMedicoModal(true);
            } else {
                alert('No se pudo cargar el perfil médico: ' + data.message);
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            alert('Error al cargar perfil médico');
        }
    };

    const handleSubmitConsulta = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/atencion/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_cita: consultaActual.id_cita,
                    id_paciente: consultaActual.id_paciente || 1, // Fallback temporal si no viene
                    id_medico: user.id_medico,
                    ...consultaForm
                })
            });

            const data = await response.json();

            if (data.status === 'OK') {
                alert('Atención médica registrada exitosamente');
                setShowConsultaModal(false);
                fetchCitas(); // Recargar agenda
            } else {
                alert('Error al registrar atención: ' + data.message);
            }
        } catch (error) {
            console.error('Error al registrar atención:', error);
            alert('Error de conexión al registrar atención');
        }
    };

    return (
        <div className="dashboard doctor-dashboard">
            <div className="dashboard-sidebar">
                <div className="sidebar-header">
                    <img src="/logo.svg" alt="Neo SISOL" className="sidebar-logo" />
                </div>
                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeSection === 'agenda' ? 'active' : ''}`}
                        onClick={() => setActiveSection('agenda')}
                    >
                        📅 Mi Agenda
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'pacientes' ? 'active' : ''}`}
                        onClick={() => setActiveSection('pacientes')}
                    >
                        👥 Mis Pacientes
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'historial' ? 'active' : ''}`}
                        onClick={() => setActiveSection('historial')}
                    >
                        📋 Historial Médico
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'perfil' ? 'active' : ''}`}
                        onClick={() => setActiveSection('perfil')}
                    >
                        👤 Mi Perfil
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
                        <h1>Bienvenido, Dr. {user?.nombres || user?.nombre || 'Médico'}</h1>
                        <p>Panel Médico</p>
                    </div>
                </header>

                <main className="dashboard-main">
                    {activeSection === 'agenda' && (
                        <div className="section-content">
                            <h2>Agenda del Día</h2>
                            <div className="citas-list">
                                {loadingCitas ? (
                                    <p>Cargando agenda...</p>
                                ) : agendaDelDia.length > 0 ? (
                                    agendaDelDia.map(cita => (
                                        <div className="cita-card" key={cita.id_cita}>
                                            <div className="cita-info">
                                                <h3>Paciente: {cita.paciente_nombre} {cita.paciente_apellido}</h3>
                                                <p>Motivo: {cita.motivo_consulta}</p>
                                                <p className="cita-fecha">📅 {cita.fechaFormatted} - 🕒 {cita.hora_cita}</p>
                                                <span className={`historial-status ${cita.estado}`}>{cita.estado}</span>
                                            </div>
                                            <div className="cita-actions">
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => handleIniciarConsulta(cita)}
                                                >
                                                    Iniciar Consulta
                                                </button>
                                                <button
                                                    className="btn-secondary"
                                                    onClick={handleVerHistoria}
                                                >
                                                    Ver Historia
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <p>No hay citas programadas para hoy.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'pacientes' && (
                        <div className="section-content">
                            <h2>Mis Pacientes Atendidos</h2>
                            <div className="pacientes-list">
                                {loadingPacientes ? (
                                    <p>Cargando pacientes...</p>
                                ) : pacientes.length > 0 ? (
                                    pacientes.map(pte => (
                                        <div className="paciente-card" key={pte.id_paciente}>
                                            <div className="paciente-avatar">👤</div>
                                            <div className="paciente-info">
                                                <h3>{pte.nombres} {pte.apellidos}</h3>
                                                <p>DNI: {pte.dni}</p>
                                                <p className="ultima-visita">Última visita: {new Date(pte.ultima_cita).toLocaleDateString()}</p>
                                            </div>
                                            <div className="paciente-actions">
                                                <button className="btn-secondary" onClick={() => handleVerHistorialPaciente(pte.id_paciente)}>Ver Atención Médica</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <p>No tienes pacientes registrados con atenciones finalizadas.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'historial' && (
                        <div className="section-content">
                            <h2>Historial Médico Global</h2>

                            <div className="search-container">
                                <div className="search-form">
                                    <input
                                        type="text"
                                        placeholder="Buscar por Nombre o DNI..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                    <input
                                        type="date"
                                        value={searchDate}
                                        onChange={(e) => setSearchDate(e.target.value)}
                                        className="search-input"
                                    />
                                    <button className="btn-primary" onClick={handleSearchPacientes}>
                                        Buscar
                                    </button>
                                </div>
                            </div>

                            <div className="pacientes-list">
                                {loadingSearch ? (
                                    <p>Buscando...</p>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(pte => (
                                        <div className="paciente-card" key={pte.id_paciente}>
                                            <div className="paciente-avatar">👤</div>
                                            <div className="paciente-info">
                                                <h3>{pte.nombres} {pte.apellidos}</h3>
                                                <p>DNI: {pte.dni}</p>
                                                <p>Tel: {pte.telefono || 'No registrado'}</p>
                                            </div>
                                            <div className="paciente-actions">
                                                <button className="btn-secondary" onClick={() => handleVerPerfilMedico(pte.id_paciente)}>Ver Perfil Médico</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <p>{searchTerm || searchDate ? 'No se encontraron pacientes.' : 'Ingrese datos para buscar.'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'perfil' && (
                        <div className="section-content">
                            <h2>Mi Perfil Profesional</h2>
                            <div className="perfil-card">
                                <div className="perfil-header">
                                    <div className="avatar">👨‍⚕️</div>
                                    <h3>Dr. {user?.nombres} {user?.apellidos}</h3>
                                    <p>Especialidad ID: {user?.id_especialidad}</p>
                                </div>
                                <div className="perfil-info">
                                    <div className="info-item">
                                        <label>Email:</label>
                                        <span>{user?.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Teléfono:</label>
                                        <span>{user?.telefono || 'No registrado'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal de Consulta Médica */}
            {showConsultaModal && (
                <div className="modal-overlay">
                    <div className="modal-content consulta-modal">
                        <div className="modal-header">
                            <h2>Atención Médica</h2>
                            <button className="close-button" onClick={() => setShowConsultaModal(false)}>×</button>
                        </div>

                        <div className="stepper">
                            <div className={`step ${consultaStep >= 1 ? 'active' : ''}`}>1. Triaje</div>
                            <div className="line"></div>
                            <div className={`step ${consultaStep >= 2 ? 'active' : ''}`}>2. Diagnóstico</div>
                            <div className="line"></div>
                            <div className={`step ${consultaStep >= 3 ? 'active' : ''}`}>3. Tratamiento</div>
                        </div>

                        <form onSubmit={handleSubmitConsulta} className="consulta-form">
                            {consultaStep === 1 && (
                                <div className="step-content">
                                    <h3>Signos Vitales y Datos Básicos</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Peso (kg)</label>
                                            <input type="number" name="peso" value={consultaForm.peso} onChange={handleConsultaChange} placeholder="Ej: 70" />
                                        </div>
                                        <div className="form-group">
                                            <label>Talla (m)</label>
                                            <input type="number" step="0.01" name="talla" value={consultaForm.talla} onChange={handleConsultaChange} placeholder="Ej: 1.75" />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Presión Arterial</label>
                                            <input type="text" name="presion_arterial" value={consultaForm.presion_arterial} onChange={handleConsultaChange} placeholder="Ej: 120/80" />
                                        </div>
                                        <div className="form-group">
                                            <label>Temperatura (°C)</label>
                                            <input type="number" step="0.1" name="temperatura" value={consultaForm.temperatura} onChange={handleConsultaChange} placeholder="Ej: 36.5" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Grupo Sanguíneo</label>
                                        <select name="grupo_sanguineo" value={consultaForm.grupo_sanguineo} onChange={handleConsultaChange}>
                                            <option value="">Seleccione</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Alergias</label>
                                        <textarea name="alergias" value={consultaForm.alergias} onChange={handleConsultaChange} rows="2" placeholder="Describa alergias conocidas" />
                                    </div>
                                    <button type="button" className="btn-primary full-width" onClick={() => setConsultaStep(2)}>Siguiente</button>
                                </div>
                            )}

                            {consultaStep === 2 && (
                                <div className="step-content">
                                    <h3>Consulta y Diagnóstico</h3>
                                    <div className="form-group">
                                        <label>Motivo de Consulta (Paciente)</label>
                                        <textarea name="motivo_consulta" value={consultaForm.motivo_consulta} onChange={handleConsultaChange} rows="2" />
                                    </div>
                                    <div className="form-group">
                                        <label>Anamnesis / Síntomas</label>
                                        <textarea name="sintomas" value={consultaForm.sintomas} onChange={handleConsultaChange} rows="3" placeholder="Detalle síntomas y relato del paciente" />
                                    </div>
                                    <div className="form-group">
                                        <label>Diagnóstico</label>
                                        <textarea name="diagnostico" value={consultaForm.diagnostico} onChange={handleConsultaChange} rows="2" placeholder="Diagnóstico presuntivo o definitivo" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Observaciones</label>
                                        <textarea name="observaciones" value={consultaForm.observaciones} onChange={handleConsultaChange} rows="2" />
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="btn-secondary" onClick={() => setConsultaStep(1)}>Atrás</button>
                                        <button type="button" className="btn-primary" onClick={() => setConsultaStep(3)}>Siguiente</button>
                                    </div>
                                </div>
                            )}

                            {consultaStep === 3 && (
                                <div className="step-content">
                                    <h3>Tratamiento y Plan</h3>
                                    <div className="form-group">
                                        <label>Tratamiento</label>
                                        <textarea name="tratamiento" value={consultaForm.tratamiento} onChange={handleConsultaChange} rows="3" placeholder="Indicaciones generales" />
                                    </div>
                                    <div className="form-group">
                                        <label>Receta Médica</label>
                                        <textarea name="receta_medica" value={consultaForm.receta_medica} onChange={handleConsultaChange} rows="4" placeholder="Medicamentos, dosis y frecuencia" />
                                    </div>
                                    <div className="form-group">
                                        <label>Próxima Cita (Opcional)</label>
                                        <input type="date" name="proxima_cita" value={consultaForm.proxima_cita} onChange={handleConsultaChange} min={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="btn-secondary" onClick={() => setConsultaStep(2)}>Atrás</button>
                                        <button type="submit" className="btn-primary">Finalizar Atención</button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
            {/* Modal de Historial (Atenciones) */}
            {showHistorialModal && (
                <div className="modal-overlay">
                    <div className="modal-content historial-modal">
                        <div className="modal-header">
                            <h2>Historial de Atenciones</h2>
                            <button className="close-button" onClick={() => setShowHistorialModal(false)}>×</button>
                        </div>
                        <div className="historial-container">
                            {historialData.length > 0 ? (
                                historialData.map((atencion, index) => (
                                    <div key={atencion.id_atencion} className="historial-item">
                                        <div className="historial-date">
                                            <span>{new Date(atencion.fecha_atencion).toLocaleDateString()}</span>
                                            <small>{new Date(atencion.fecha_atencion).toLocaleTimeString()}</small>
                                        </div>
                                        <div className="historial-details">
                                            <h4>{atencion.motivo_consulta}</h4>
                                            <p><strong>Diagnóstico:</strong> {atencion.diagnostico}</p>
                                            <p><strong>Tratamiento:</strong> {atencion.tratamiento}</p>
                                            <p><strong>Receta:</strong> {atencion.receta_medica}</p>
                                            {atencion.signos_vitales && (() => {
                                                try {
                                                    const sv = typeof atencion.signos_vitales === 'string'
                                                        ? JSON.parse(atencion.signos_vitales)
                                                        : atencion.signos_vitales;
                                                    return (
                                                        <div className="signos-vitales-tags">
                                                            <span>P: {sv.peso || '-'}kg</span>
                                                            <span>T: {sv.talla || '-'}m</span>
                                                            <span>PA: {sv.presion || '-'}</span>
                                                        </div>
                                                    );
                                                } catch (e) { return null; }
                                            })()}
                                        </div>
                                        <div className="historial-doctor">
                                            Dr. {atencion.medico_apellido}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-state">No se encontraron registros anteriores.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Perfil Médico Completo */}
            {showPerfilMedicoModal && perfilMedicoData && (
                <div className="modal-overlay">
                    <div className="modal-content historial-modal">
                        <div className="modal-header">
                            <h2>Historia Clínica: {perfilMedicoData.nombres} {perfilMedicoData.apellidos}</h2>
                            <button className="close-button" onClick={() => setShowPerfilMedicoModal(false)}>×</button>
                        </div>
                        <div className="historial-container perfil-medico-container">
                            <div className="perfil-section">
                                <h3>Datos Personales</h3>
                                <div className="info-grid">
                                    <p><strong>DNI:</strong> {perfilMedicoData.dni}</p>
                                    <p><strong>Fecha Nacimiento:</strong> {new Date(perfilMedicoData.fecha_nacimiento).toLocaleDateString()}</p>
                                    <p><strong>Edad:</strong> {new Date().getFullYear() - new Date(perfilMedicoData.fecha_nacimiento).getFullYear()} años</p>
                                    <p><strong>Género:</strong> {perfilMedicoData.genero}</p>
                                    <p><strong>Grupo Sanguíneo:</strong> {perfilMedicoData.grupo_sanguineo || 'No registrado'}</p>
                                    <p><strong>Teléfono:</strong> {perfilMedicoData.telefono || '-'}</p>
                                </div>
                            </div>

                            <div className="perfil-section">
                                <h3>Antecedentes Médicos</h3>
                                <div className="info-group">
                                    <label>Alergias:</label>
                                    <p>{perfilMedicoData.alergias || 'Ninguna conocida'}</p>
                                </div>
                                {perfilMedicoData.historial_medico ? (
                                    <>
                                        <div className="info-group">
                                            <label>Enfermedades Crónicas:</label>
                                            <p>{perfilMedicoData.historial_medico.enfermedades_cronicas || 'Ninguna'}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Antecedentes Familiares:</label>
                                            <p>{perfilMedicoData.historial_medico.antecedentes_familiares || '-'}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Cirugías Previas:</label>
                                            <p>{perfilMedicoData.historial_medico.cirugias_previas || 'Ninguna'}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Medicamentos Habituales:</label>
                                            <p>{perfilMedicoData.historial_medico.medicamentos_actuales || 'Ninguno'}</p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted">No se ha registrado información detallada de antecedentes.</p>
                                )}
                            </div>

                            <div className="perfil-actions" style={{ marginTop: '20px', textAlign: 'right' }}>
                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        handleVerHistorialPaciente(perfilMedicoData.id_paciente);
                                        // Opcional: Cerrar este modal si se desea
                                        // setShowPerfilMedicoModal(false); 
                                    }}
                                >
                                    Ver Atenciones Previas
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
