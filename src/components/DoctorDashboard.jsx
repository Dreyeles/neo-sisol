import React, { useState } from 'react';
import './Dashboard.css'; // Reusing existing dashboard styles
import './DoctorDashboard.css'; // Doctor-specific styles
import LogoutIcon from './LogoutIcon';

const DoctorDashboard = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState('agenda');

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
                        <h1>Bienvenido, Dr. {user?.nombre || 'Médico'}</h1>
                        <p>Panel Médico</p>
                    </div>
                </header>

                <main className="dashboard-main">
                    {activeSection === 'agenda' && (
                        <div className="section-content">
                            <h2>Agenda del Día</h2>
                            <div className="citas-list">
                                <div className="cita-card">
                                    <div className="cita-info">
                                        <h3>Paciente: Juan Pérez</h3>
                                        <p>Motivo: Consulta General</p>
                                        <p className="cita-fecha">🕒 10:00 AM</p>
                                    </div>
                                    <div className="cita-actions">
                                        <button className="btn-primary">Iniciar Consulta</button>
                                        <button className="btn-secondary">Ver Historia</button>
                                    </div>
                                </div>
                                <div className="cita-card">
                                    <div className="cita-info">
                                        <h3>Paciente: María García</h3>
                                        <p>Motivo: Control</p>
                                        <p className="cita-fecha">🕒 11:00 AM</p>
                                    </div>
                                    <div className="cita-actions">
                                        <button className="btn-primary">Iniciar Consulta</button>
                                        <button className="btn-secondary">Ver Historia</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'pacientes' && (
                        <div className="section-content">
                            <h2>Mis Pacientes</h2>
                            <div className="historial-list">
                                <div className="historial-item">
                                    <div className="historial-info">
                                        <h3>Juan Pérez</h3>
                                        <p>Última visita: 10 de Enero, 2024</p>
                                    </div>
                                    <button className="btn-secondary">Ver Expediente</button>
                                </div>
                                <div className="historial-item">
                                    <div className="historial-info">
                                        <h3>María García</h3>
                                        <p>Última visita: 5 de Enero, 2024</p>
                                    </div>
                                    <button className="btn-secondary">Ver Expediente</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'perfil' && (
                        <div className="section-content">
                            <h2>Mi Perfil Profesional</h2>
                            <div className="perfil-card">
                                <div className="perfil-header">
                                    <div className="avatar">👨‍⚕️</div>
                                    <h3>Dr. {user?.nombre || 'Médico'}</h3>
                                    <p>Medicina General</p>
                                </div>
                                <div className="perfil-info">
                                    <div className="info-item">
                                        <label>CMP:</label>
                                        <span>12345</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Email:</label>
                                        <span>medico@sisol.gob.pe</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Sede:</label>
                                        <span>Central</span>
                                    </div>
                                </div>
                                <button className="btn-primary">Editar Información</button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default DoctorDashboard;
