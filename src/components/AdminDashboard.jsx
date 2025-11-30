import React, { useState } from 'react';
import './Dashboard.css'; // Reusing existing dashboard styles
import './AdminDashboard.css'; // Admin-specific styles
import LogoutIcon from './LogoutIcon';

const AdminDashboard = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState('usuarios');
    const [showAddDoctorForm, setShowAddDoctorForm] = useState(false);
    const [doctors, setDoctors] = useState([
        { id: 1, nombre: 'Dr. Juan Pérez', especialidad: 'Medicina General', cmp: '12345' },
        { id: 2, nombre: 'Dra. María García', especialidad: 'Cardiología', cmp: '67890' },
    ]);
    const [newDoctor, setNewDoctor] = useState({
        nombre: '',
        especialidad: '',
        cmp: ''
    });

    const handleAddDoctor = (e) => {
        e.preventDefault();
        if (newDoctor.nombre && newDoctor.especialidad && newDoctor.cmp) {
            const doctor = {
                id: doctors.length + 1,
                ...newDoctor
            };
            setDoctors([...doctors, doctor]);
            setNewDoctor({ nombre: '', especialidad: '', cmp: '' });
            setShowAddDoctorForm(false);
        }
    };

    const handleCancelAdd = () => {
        setNewDoctor({ nombre: '', especialidad: '', cmp: '' });
        setShowAddDoctorForm(false);
    };

    return (
        <div className="dashboard admin-dashboard">
            <div className="dashboard-sidebar">
                <div className="sidebar-header">
                    <img src="/logo.svg" alt="Neo SISOL" className="sidebar-logo" />
                </div>
                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeSection === 'usuarios' ? 'active' : ''}`}
                        onClick={() => setActiveSection('usuarios')}
                    >
                        👥 Usuarios
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'medicos' ? 'active' : ''}`}
                        onClick={() => setActiveSection('medicos')}
                    >
                        👨‍⚕️ Médicos
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'reportes' ? 'active' : ''}`}
                        onClick={() => setActiveSection('reportes')}
                    >
                        📊 Reportes
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'configuracion' ? 'active' : ''}`}
                        onClick={() => setActiveSection('configuracion')}
                    >
                        ⚙️ Configuración
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
                        <h1>Panel de Administración</h1>
                        <p>Bienvenido, {user?.nombre || 'Administrador'}</p>
                    </div>
                </header>

                <main className="dashboard-main">
                    {activeSection === 'usuarios' && (
                        <div className="section-content">
                            <h2>Gestión de Usuarios</h2>
                            <div className="historial-list">
                                <div className="historial-item">
                                    <div className="historial-info">
                                        <h3>Juan Pérez</h3>
                                        <p>Email: juan@email.com</p>
                                        <p className="historial-fecha">Registrado: 10 de Enero, 2024</p>
                                    </div>
                                    <div className="cita-actions">
                                        <button className="btn-secondary">Editar</button>
                                        <button className="btn-danger">Desactivar</button>
                                    </div>
                                </div>
                                <div className="historial-item">
                                    <div className="historial-info">
                                        <h3>María García</h3>
                                        <p>Email: maria@email.com</p>
                                        <p className="historial-fecha">Registrado: 5 de Enero, 2024</p>
                                    </div>
                                    <div className="cita-actions">
                                        <button className="btn-secondary">Editar</button>
                                        <button className="btn-danger">Desactivar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'medicos' && (
                        <div className="section-content">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2>Gestión de Médicos</h2>
                                {!showAddDoctorForm && (
                                    <button className="btn-primary" onClick={() => setShowAddDoctorForm(true)}>
                                        ➕ Agregar Médico
                                    </button>
                                )}
                            </div>

                            {showAddDoctorForm && (
                                <div className="agendar-form" style={{ marginBottom: '24px' }}>
                                    <h3>Nuevo Médico</h3>
                                    <form onSubmit={handleAddDoctor}>
                                        <div className="form-group">
                                            <label>Nombre Completo</label>
                                            <input
                                                type="text"
                                                value={newDoctor.nombre}
                                                onChange={(e) => setNewDoctor({ ...newDoctor, nombre: e.target.value })}
                                                placeholder="Dr. Juan Pérez"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Especialidad</label>
                                            <input
                                                type="text"
                                                value={newDoctor.especialidad}
                                                onChange={(e) => setNewDoctor({ ...newDoctor, especialidad: e.target.value })}
                                                placeholder="Medicina General"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>CMP</label>
                                            <input
                                                type="text"
                                                value={newDoctor.cmp}
                                                onChange={(e) => setNewDoctor({ ...newDoctor, cmp: e.target.value })}
                                                placeholder="12345"
                                                required
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button type="submit" className="btn-primary">Guardar</button>
                                            <button type="button" className="btn-secondary" onClick={handleCancelAdd}>Cancelar</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="historial-list">
                                {doctors.map(doctor => (
                                    <div className="historial-item" key={doctor.id}>
                                        <div className="historial-info">
                                            <h3>{doctor.nombre}</h3>
                                            <p>Especialidad: {doctor.especialidad}</p>
                                            <p>CMP: {doctor.cmp}</p>
                                        </div>
                                        <div className="cita-actions">
                                            <button className="btn-secondary">Ver Perfil</button>
                                            <button className="btn-primary">Editar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'reportes' && (
                        <div className="section-content">
                            <h2>Reportes del Sistema</h2>
                            <div className="citas-list">
                                <div className="cita-card">
                                    <div className="cita-info">
                                        <h3>Citas del Mes</h3>
                                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af' }}>156</p>
                                    </div>
                                </div>
                                <div className="cita-card">
                                    <div className="cita-info">
                                        <h3>Pacientes Activos</h3>
                                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af' }}>89</p>
                                    </div>
                                </div>
                                <div className="cita-card">
                                    <div className="cita-info">
                                        <h3>Médicos Disponibles</h3>
                                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af' }}>{doctors.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'configuracion' && (
                        <div className="section-content">
                            <h2>Configuración del Sistema</h2>
                            <div className="perfil-card">
                                <div className="perfil-info">
                                    <div className="info-item">
                                        <label>Nombre del Sistema:</label>
                                        <span>Neo SISOL</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Versión:</label>
                                        <span>1.0.0</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Sede Principal:</label>
                                        <span>Central</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Email de Contacto:</label>
                                        <span>contacto@sisol.gob.pe</span>
                                    </div>
                                </div>
                                <button className="btn-primary">Guardar Cambios</button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
