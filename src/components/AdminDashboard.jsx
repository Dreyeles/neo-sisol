import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import './AdminDashboard.css';
import LogoutIcon from './LogoutIcon';

const AdminDashboard = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState('pacientes');
    const [showAddDoctorForm, setShowAddDoctorForm] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showEditDoctorModal, setShowEditDoctorModal] = useState(false);
    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [showEditServiceModal, setShowEditServiceModal] = useState(false);

    const [newDoctor, setNewDoctor] = useState({
        username: '',
        password: '',
        dni: '',
        nombres: '',
        apellidos: '',
        fecha_nacimiento: '',
        genero: 'otro',
        telefono: '',
        celular: '',
        direccion: '',
        id_especialidad: '',
        numero_colegiatura: '',
        titulo_profesional: '',
        universidad: '',
        anios_experiencia: 0,
        firma_digital: '',
        turno: 'Mañana',
        costo_consulta: 0
    });

    useEffect(() => {
        fetchDoctors();
        fetchPatients();
        fetchSpecialties();
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoadingServices(true);
        try {
            const response = await fetch('http://localhost:5000/api/servicios');
            const result = await response.json();
            if (result.status === 'OK') {
                setServices(result.data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoadingServices(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/pacientes');
            const result = await response.json();
            if (result.status === 'OK') {
                setPatients(result.data);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/medicos');
            const result = await response.json();
            if (result.status === 'OK') {
                setDoctors(result.data);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSpecialties = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/especialidades');
            const result = await response.json();
            if (result.status === 'OK') {
                setSpecialties(result.data);
            }
        } catch (error) {
            console.error('Error fetching specialties:', error);
        }
    };

    const handleAddDoctor = async (e) => {
        e.preventDefault();

        const fullEmail = `medico.${newDoctor.username}@sisol.com`;
        const horario = newDoctor.turno === 'Mañana' ? '08:00 - 13:00' : '14:00 - 19:00';

        const doctorToSave = {
            ...newDoctor,
            email: fullEmail,
            horario_atencion: horario
        };

        // Remove username from payload as backend expects email
        delete doctorToSave.username;

        try {
            const response = await fetch('http://localhost:5000/api/medicos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(doctorToSave)
            });

            const result = await response.json();

            if (result.status === 'OK') {
                alert('Médico registrado con éxito');
                setShowAddDoctorForm(false);
                fetchDoctors();
                resetForm();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error adding doctor:', error);
            alert('Error de conexión con el servidor');
        }
    };

    const handleUpdateDoctor = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/medicos/${selectedDoctor.id_medico}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedDoctor)
            });

            const result = await response.json();
            if (result.status === 'OK') {
                alert('Médico actualizado con éxito');
                setShowEditDoctorModal(false);
                fetchDoctors();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating doctor:', error);
            alert('Error de conexión');
        }
    };

    const handleUpdateService = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/servicios/${selectedService.id_servicio}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedService)
            });

            const result = await response.json();
            if (result.status === 'OK') {
                alert('Servicio actualizado con éxito');
                setShowEditServiceModal(false);
                fetchServices();
            }
        } catch (error) {
            console.error('Error updating service:', error);
        }
    };

    const resetForm = () => {
        setNewDoctor({
            username: '', password: '', dni: '', nombres: '', apellidos: '',
            fecha_nacimiento: '', genero: 'otro', telefono: '', celular: '',
            direccion: '', id_especialidad: '', numero_colegiatura: '',
            titulo_profesional: '', universidad: '', anios_experiencia: 0,
            firma_digital: '', turno: 'Mañana', costo_consulta: 0
        });
    };

    const handleCancelAdd = () => {
        resetForm();
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
                        className={`nav-item ${activeSection === 'pacientes' ? 'active' : ''}`}
                        onClick={() => setActiveSection('pacientes')}
                    >
                        👥 Pacientes
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
                        className={`nav-item ${activeSection === 'servicios' ? 'active' : ''}`}
                        onClick={() => setActiveSection('servicios')}
                    >
                        💊 Servicios
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
                    {activeSection === 'pacientes' && (
                        <div className="section-content">
                            <h2>Gestión de Pacientes</h2>
                            <div className="historial-list">
                                {patients.length === 0 ? (
                                    <p>No hay pacientes registrados.</p>
                                ) : (
                                    patients.map(patient => (
                                        <div className="historial-item" key={patient.id_paciente}>
                                            <div className="historial-info">
                                                <h3>{patient.nombres} {patient.apellidos}</h3>
                                                <p><strong>Email:</strong> {patient.email}</p>
                                                <p><strong>DNI:</strong> {patient.dni}</p>
                                                <p className="historial-fecha">DNI del paciente: {patient.dni}</p>
                                            </div>
                                            <div className="cita-actions">
                                                <button className="btn-secondary">Ver Historia</button>
                                                <button className="btn-danger">Desactivar</button>
                                            </div>
                                        </div>
                                    ))
                                )}
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
                                <div className="agendar-form" style={{ marginBottom: '24px', maxWidth: '800px' }}>
                                    <h3>Nuevo Médico</h3>
                                    <form onSubmit={handleAddDoctor} className="admin-form-grid">
                                        <div className="form-section-title">Datos de Acceso</div>
                                        <div className="form-group">
                                            <label>Email (Usuario)</label>
                                            <div className="email-input-wrapper">
                                                <span className="email-prefix">medico.</span>
                                                <input
                                                    type="text"
                                                    value={newDoctor.username}
                                                    onChange={(e) => setNewDoctor({ ...newDoctor, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                                    required
                                                    placeholder="nombre.apellido"
                                                    className="email-username-input"
                                                />
                                                <span className="email-suffix">@sisol.com</span>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Contraseña</label>
                                            <input type="password" value={newDoctor.password} onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })} required placeholder="********" />
                                        </div>

                                        <div className="form-section-title">Datos Personales</div>
                                        <div className="form-group">
                                            <label>DNI</label>
                                            <input type="text" value={newDoctor.dni} onChange={(e) => setNewDoctor({ ...newDoctor, dni: e.target.value })} required maxLength="8" />
                                        </div>
                                        <div className="form-group">
                                            <label>Nombres</label>
                                            <input type="text" value={newDoctor.nombres} onChange={(e) => setNewDoctor({ ...newDoctor, nombres: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Apellidos</label>
                                            <input type="text" value={newDoctor.apellidos} onChange={(e) => setNewDoctor({ ...newDoctor, apellidos: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de Nacimiento</label>
                                            <input type="date" value={newDoctor.fecha_nacimiento} onChange={(e) => setNewDoctor({ ...newDoctor, fecha_nacimiento: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Género</label>
                                            <select value={newDoctor.genero} onChange={(e) => setNewDoctor({ ...newDoctor, genero: e.target.value })}>
                                                <option value="masculino">Masculino</option>
                                                <option value="femenino">Femenino</option>
                                                <option value="otro">Otro</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Celular</label>
                                            <input type="text" value={newDoctor.celular} onChange={(e) => setNewDoctor({ ...newDoctor, celular: e.target.value })} />
                                        </div>

                                        <div className="form-section-title">Información Profesional</div>
                                        <div className="form-group">
                                            <label>Especialidad</label>
                                            <select value={newDoctor.id_especialidad} onChange={(e) => setNewDoctor({ ...newDoctor, id_especialidad: e.target.value })} required>
                                                <option value="">Seleccione especialidad</option>
                                                {specialties.map(esp => (
                                                    <option key={esp.id_especialidad} value={esp.id_especialidad}>{esp.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Número Colegiatura (CMP)</label>
                                            <input type="text" value={newDoctor.numero_colegiatura} onChange={(e) => setNewDoctor({ ...newDoctor, numero_colegiatura: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Título Profesional</label>
                                            <input type="text" value={newDoctor.titulo_profesional} onChange={(e) => setNewDoctor({ ...newDoctor, titulo_profesional: e.target.value })} placeholder="Ej: Médico Cirujano" />
                                        </div>
                                        <div className="form-group">
                                            <label>Universidad</label>
                                            <input type="text" value={newDoctor.universidad} onChange={(e) => setNewDoctor({ ...newDoctor, universidad: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Años de Experiencia</label>
                                            <input type="number" value={newDoctor.anios_experiencia} onChange={(e) => setNewDoctor({ ...newDoctor, anios_experiencia: e.target.value })} min="0" />
                                        </div>
                                        <div className="form-group">
                                            <label>Turno</label>
                                            <select value={newDoctor.turno} onChange={(e) => setNewDoctor({ ...newDoctor, turno: e.target.value })}>
                                                <option value="Mañana">Mañana (8am - 1pm)</option>
                                                <option value="Tarde">Tarde (2pm - 7pm)</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Costo Consulta (S/.)</label>
                                            <input type="number" value={newDoctor.costo_consulta} onChange={(e) => setNewDoctor({ ...newDoctor, costo_consulta: e.target.value })} min="0" />
                                        </div>
                                        <div className="form-group">
                                            <label>Firma Digital (Ruta/ID)</label>
                                            <input type="text" value={newDoctor.firma_digital} onChange={(e) => setNewDoctor({ ...newDoctor, firma_digital: e.target.value })} placeholder="firma_id_123" />
                                        </div>

                                        <div className="form-actions-full" style={{ gridColumn: '1 / -1', marginTop: '20px', display: 'flex', gap: '12px' }}>
                                            <button type="submit" className="btn-primary">Registrar Médico</button>
                                            <button type="button" className="btn-secondary" onClick={handleCancelAdd}>Cancelar</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="historial-list">
                                {loading ? <p>Cargando médicos...</p> :
                                    doctors.length === 0 ? <p>No hay médicos registrados.</p> :
                                        doctors.map(doctor => (
                                            <div className="historial-item" key={doctor.id_medico}>
                                                <div className="historial-info">
                                                    <h3>{doctor.nombres} {doctor.apellidos}</h3>
                                                    <p><strong>Especialidad:</strong> {doctor.especialidad_nombre}</p>
                                                    <p><strong>CMP:</strong> {doctor.numero_colegiatura}</p>
                                                    <p><strong>Turno:</strong> {doctor.horario_atencion}</p>
                                                    <p className="historial-fecha">Contratado: {new Date(doctor.fecha_contratacion).toLocaleDateString()}</p>
                                                </div>
                                                <div className="cita-actions">
                                                    <button className="btn-secondary" onClick={() => {
                                                        setSelectedDoctor(doctor);
                                                        setShowProfileModal(true);
                                                    }}>Ver Perfil</button>
                                                    <button className="btn-primary" onClick={() => {
                                                        setSelectedDoctor({ ...doctor });
                                                        setShowEditDoctorModal(true);
                                                    }}>Editar</button>
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

                    {activeSection === 'servicios' && (
                        <div className="section-content">
                            <h2>Gestión de Servicios Médicos</h2>
                            <div className="historial-list">
                                {loadingServices ? <p>Cargando servicios...</p> :
                                    services.length === 0 ? <p>No hay servicios registrados.</p> :
                                        services.map(service => (
                                            <div className="historial-item" key={service.id_servicio}>
                                                <div className="historial-info">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '24px' }}>💊</span>
                                                        <h3 style={{ margin: 0 }}>{service.nombre}</h3>
                                                    </div>
                                                    <p><strong>Dpto:</strong> {service.departamento_nombre}</p>
                                                    <p><strong>Precio:</strong> <span style={{ color: '#1e40af', fontWeight: 'bold', fontSize: '1.1em' }}>S/. {parseFloat(service.costo).toFixed(2)}</span></p>
                                                    <p><strong>Estado:</strong> <span className={`historial-status ${service.estado}`}>{service.estado}</span></p>
                                                </div>
                                                <div className="cita-actions">
                                                    <button className="btn-primary" onClick={() => {
                                                        setSelectedService({ ...service });
                                                        setShowEditServiceModal(true);
                                                    }}>Actualizar Precio</button>
                                                </div>
                                            </div>
                                        ))}
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

            {/* Modal Perfil Médico */}
            {showProfileModal && selectedDoctor && (
                <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Perfil del Médico</h3>
                            <button className="close-btn" onClick={() => setShowProfileModal(false)}>×</button>
                        </div>
                        <div className="modal-body profile-grid">
                            <div className="profile-section">
                                <h4>Información Personal</h4>
                                <p><strong>Nombre:</strong> {selectedDoctor.nombres} {selectedDoctor.apellidos}</p>
                                <p><strong>DNI:</strong> {selectedDoctor.dni}</p>
                                <p><strong>Género:</strong> {selectedDoctor.genero}</p>
                                <p><strong>Celular:</strong> {selectedDoctor.celular}</p>
                                <p><strong>Email:</strong> {selectedDoctor.email}</p>
                            </div>
                            <div className="profile-section">
                                <h4>Información Profesional</h4>
                                <p><strong>Especialidad:</strong> {selectedDoctor.especialidad_nombre}</p>
                                <p><strong>CMP:</strong> {selectedDoctor.numero_colegiatura}</p>
                                <p><strong>Título:</strong> {selectedDoctor.titulo_profesional}</p>
                                <p><strong>Universidad:</strong> {selectedDoctor.universidad}</p>
                                <p><strong>Experiencia:</strong> {selectedDoctor.anios_experiencia} años</p>
                                <p><strong>Costo Consulta:</strong> S/. {parseFloat(selectedDoctor.costo_consulta).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Médico */}
            {showEditDoctorModal && selectedDoctor && (
                <div className="modal-overlay" onClick={() => setShowEditDoctorModal(false)}>
                    <div className="modal-content admin-form-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Editar Médico</h3>
                            <button className="close-btn" onClick={() => setShowEditDoctorModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleUpdateDoctor} className="admin-form-grid" style={{ padding: '20px' }}>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={selectedDoctor.email} onChange={e => setSelectedDoctor({ ...selectedDoctor, email: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Costo Consulta (S/.)</label>
                                <input type="number" value={selectedDoctor.costo_consulta} onChange={e => setSelectedDoctor({ ...selectedDoctor, costo_consulta: e.target.value })} step="0.01" required />
                            </div>
                            <div className="form-group">
                                <label>Estado</label>
                                <select value={selectedDoctor.estado} onChange={e => setSelectedDoctor({ ...selectedDoctor, estado: e.target.value })}>
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Celular</label>
                                <input type="text" value={selectedDoctor.celular} onChange={e => setSelectedDoctor({ ...selectedDoctor, celular: e.target.value })} />
                            </div>
                            <div className="form-actions-full" style={{ gridColumn: '1 / -1' }}>
                                <button type="submit" className="btn-primary">Guardar Cambios</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowEditDoctorModal(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar Servicio */}
            {showEditServiceModal && selectedService && (
                <div className="modal-overlay" onClick={() => setShowEditServiceModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3>Editar Servicio</h3>
                            <button className="close-btn" onClick={() => setShowEditServiceModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleUpdateService} style={{ padding: '20px' }}>
                            <p><strong>Servicio:</strong> {selectedService.nombre}</p>
                            <div className="form-group">
                                <label>Precio (S/.)</label>
                                <input type="number" value={selectedService.costo} onChange={e => setSelectedService({ ...selectedService, costo: e.target.value })} step="0.01" required />
                            </div>
                            <div className="form-group">
                                <label>Estado</label>
                                <select value={selectedService.estado} onChange={e => setSelectedService({ ...selectedService, estado: e.target.value })}>
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>
                            <div className="form-actions-full">
                                <button type="submit" className="btn-primary">Guardar</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowEditServiceModal(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
