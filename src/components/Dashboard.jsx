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

  // Estado para citas reales
  const [citas, setCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);

  // Estado para el formulario de citas
  const [citaEspecialidad, setCitaEspecialidad] = useState('');
  const [citaMedico, setCitaMedico] = useState('');
  const [citaFecha, setCitaFecha] = useState('');
  const [citaTurno, setCitaTurno] = useState('');
  const [citaMotivo, setCitaMotivo] = useState('');

  // Estado para lógica dinámica
  const [medicos, setMedicos] = useState([]);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [availability, setAvailability] = useState(null); // { available: true/false, message: '' }
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Estado para modal de pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [metodoPago, setMetodoPago] = useState('');
  const [billeteraEspecifica, setBilleteraEspecifica] = useState(''); // 'yape' o 'plin'
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [numeroTransaccion, setNumeroTransaccion] = useState('');
  const [codigoAprobacion, setCodigoAprobacion] = useState(''); // Para Yape
  const [qrYape, setQrYape] = useState(''); // Para Yape
  const [processingPayment, setProcessingPayment] = useState(false);
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [cvv, setCvv] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');

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

  // Cargar citas reales del paciente
  const fetchCitas = async () => {
    // Si no hay ID de paciente, no intentamos cargar y quitamos el loading
    if (!user?.id_paciente) {
      setLoadingCitas(false);
      return;
    }

    setLoadingCitas(true);
    try {
      const response = await fetch(`http://localhost:5000/api/citas/paciente/${user.id_paciente}`);

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();

      if (data.status === 'OK') {
        setCitas(data.data);
      } else {
        console.error('Error del servidor:', data.message);
        // Si hay error en la respuesta, asumimos lista vacía para no bloquear la UI
        setCitas([]);
      }
    } catch (error) {
      console.error('Error al cargar citas:', error);
      setCitas([]); // En caso de error de red, lista vacía
    } finally {
      setLoadingCitas(false);
    }
  };

  useEffect(() => {
    console.log('Usuario actual en Dashboard:', user);
    if (user?.id_paciente) {
      console.log('Buscando citas para paciente ID:', user.id_paciente);
      fetchCitas();
    } else {
      console.log('No hay ID de paciente, saltando fetchCitas');
      setLoadingCitas(false);
    }
  }, [user]);

  // Cargar médicos cuando cambia la especialidad
  useEffect(() => {
    if (!citaEspecialidad) {
      setMedicos([]);
      return;
    }

    const fetchMedicos = async () => {
      setLoadingMedicos(true);
      try {
        const response = await fetch(`http://localhost:5000/api/medicos/por-especialidad/${citaEspecialidad}`);
        const data = await response.json();

        if (data.status === 'OK') {
          setMedicos(data.data);
        }
      } catch (error) {
        console.error('Error al cargar médicos:', error);
      } finally {
        setLoadingMedicos(false);
      }
    };

    fetchMedicos();
  }, [citaEspecialidad]);

  // Verificar disponibilidad cuando cambian los datos requeridos
  useEffect(() => {
    if (!citaMedico || !citaFecha || !citaTurno) {
      setAvailability(null);
      return;
    }

    const checkAvailability = async () => {
      setCheckingAvailability(true);
      try {
        const response = await fetch('http://localhost:5000/api/citas/check-availability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_medico: citaMedico,
            fecha: citaFecha,
            turno: citaTurno
          }),
        });
        const data = await response.json();

        if (data.status === 'OK') {
          setAvailability({
            available: data.available,
            message: data.message
          });
        }
      } catch (error) {
        console.error('Error al verificar disponibilidad:', error);
      } finally {
        setCheckingAvailability(false);
      }
    };

    // Debounce pequeño para evitar muchas llamadas si el usuario cambia rápido
    const timeoutId = setTimeout(() => {
      checkAvailability();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [citaMedico, citaFecha, citaTurno]);

  const handleAgendarCita = (e) => {
    e.preventDefault();
    if (availability && availability.available) {
      // Mostrar modal de pago en lugar de agendar directamente
      setShowPaymentModal(true);
    }
  };

  const handleConfirmPayment = async () => {
    if (!metodoPago) {
      alert('Por favor seleccione un método de pago');
      return;
    }

    // Validar que si es billetera digital, se haya seleccionado yape o plin
    if (metodoPago === 'billetera_digital' && !billeteraEspecifica) {
      alert('Por favor seleccione Yape o Plin');
      return;
    }

    if (!user || !user.id_paciente) {
      console.error('Datos de usuario incompletos:', user);
      alert('Error: No se ha identificado al paciente. Por favor, cierre sesión e ingrese nuevamente.');
      return;
    }

    setProcessingPayment(true);

    try {
      // Determinar el método de pago final para enviar al backend
      const metodoPagoFinal = metodoPago === 'billetera_digital' ? billeteraEspecifica : metodoPago;

      const payload = {
        id_paciente: user.id_paciente,
        id_medico: citaMedico,
        fecha_cita: citaFecha,
        turno: citaTurno,
        motivo_consulta: citaMotivo,
        metodo_pago: metodoPagoFinal,
        numero_transaccion: numeroTransaccion || undefined,
        comprobante_tipo: 'boleta'
      };

      console.log('Enviando pago:', payload);

      const response = await fetch('http://localhost:5000/api/pagos/procesar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === 'OK') {
        alert('¡Pago procesado y cita agendada con éxito!');
        // Resetear formulario
        setCitaEspecialidad('');
        setCitaMedico('');
        setCitaFecha('');
        setCitaTurno('');
        setCitaMotivo('');
        setMetodoPago('');
        setBilleteraEspecifica('');
        setNumeroTarjeta('');
        setFechaExpiracion('');
        setCvv('');
        setNombreTitular('');
        setNumeroTransaccion('');
        setCodigoAprobacion('');
        setQrYape('');
        setShowPaymentModal(false);
        setActiveSection('citas');
        // Recargar citas
        fetchCitas();
      } else {
        console.error('Error backend:', data);
        let errorMsg = 'Error al procesar el pago: ' + data.message;
        if (data.details) {
          errorMsg += '\nDetalles: ' + JSON.stringify(data.details);
        }
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert('Error al procesar el pago (red)');
    } finally {
      setProcessingPayment(false);
    }
  };

  const filteredResultados = MOCK_RESULTADOS.filter(item => {
    const matchDate = filterDate ? item.fecha === filterDate : true;
    const matchService = filterService ? item.servicio === filterService : true;
    return matchDate && matchService;
  });

  const filteredHistorial = citas.filter(item => {
    // Para historial filtrar las citas pasadas o completadas, aqui mostramos todas por ahora
    const matchDate = filterHistorialDate ? item.fecha_cita.startsWith(filterHistorialDate) : true;
    const matchSpecialty = filterHistorialSpecialty ? item.especialidad === filterHistorialSpecialty : true;
    return matchDate && matchSpecialty;
  });

  // Filtrar citas futuras para "Mis Próximas Citas"
  const proximasCitas = citas.filter(c => c.estado === 'programada');

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
                {loadingCitas ? (
                  <p>Cargando citas...</p>
                ) : proximasCitas.length > 0 ? (
                  proximasCitas.map(cita => (
                    <div className="cita-card" key={cita.id_cita}>
                      <div className="cita-info">
                        <h3>{cita.especialidad}</h3>
                        <p>Dr. {cita.medico_nombre} {cita.medico_apellido}</p>
                        <p className="cita-fecha">📅 {cita.fechaFormatted} - {cita.hora_cita}</p>
                      </div>
                      <div className="cita-actions">
                        <span className={`historial-status ${cita.estado}`}>{cita.estado}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state" style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    textAlign: 'center',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                    <p style={{ fontSize: '18px', color: '#4a5568', marginBottom: '8px' }}>No tienes ninguna cita agendada</p>
                    <p style={{ color: '#718096', marginBottom: '24px' }}>Comienza a cuidar tu salud agendando una cita hoy mismo.</p>
                    <button
                      className="btn-primary"
                      onClick={() => setActiveSection('agendar')}
                    >
                      Agenda tu primera cita ahora
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'agendar' && (
            <div className="section-content">
              <h2>Agendar Nueva Cita</h2>
              <form className="agendar-form" onSubmit={handleAgendarCita}>
                <div className="form-group">
                  <label>Especialidad</label>
                  <select
                    value={citaEspecialidad}
                    onChange={(e) => {
                      setCitaEspecialidad(e.target.value);
                      setCitaMedico(''); // Reset médico al cambiar especialidad
                      setAvailability(null);
                    }}
                    required
                  >
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
                  <select
                    value={citaMedico}
                    onChange={(e) => setCitaMedico(e.target.value)}
                    disabled={!citaEspecialidad || loadingMedicos}
                    required
                  >
                    <option value="">Seleccione un médico</option>
                    {loadingMedicos ? (
                      <option disabled>Cargando médicos...</option>
                    ) : (
                      medicos.map(med => (
                        <option key={med.id_medico} value={med.id_medico}>
                          {med.nombres} {med.apellidos}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={citaFecha}
                    onChange={(e) => setCitaFecha(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Turno</label>
                  <select
                    value={citaTurno}
                    onChange={(e) => setCitaTurno(e.target.value)}
                    required
                  >
                    <option value="">Seleccione un turno</option>
                    <option value="manana">Mañana (7:00 AM - 12:00 PM)</option>
                    <option value="tarde">Tarde (2:00 PM - 7:00 PM)</option>
                  </select>
                </div>

                {/* Mensaje de disponibilidad */}
                {checkingAvailability && <p className="status-checking">Verificando disponibilidad...</p>}
                {!checkingAvailability && availability && (
                  <div className={`availability-message ${availability.available ? 'success' : 'error'}`}>
                    {availability.message}
                  </div>
                )}

                <div className="form-group">
                  <label>Motivo de la consulta</label>
                  <textarea
                    rows="4"
                    placeholder="Describa el motivo de su consulta..."
                    value={citaMotivo}
                    onChange={(e) => setCitaMotivo(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!availability?.available || checkingAvailability}
                >
                  Agendar Cita
                </button>
              </form>

              {/* Modal de Pago */}
              {showPaymentModal && (
                <div className="payment-modal-overlay" onClick={() => setShowPaymentModal(false)}>
                  <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="payment-modal-header">
                      <h3>💳 Pasarela de Pago</h3>
                      <button className="close-modal" onClick={() => setShowPaymentModal(false)}>✕</button>
                    </div>

                    <div className="payment-modal-body">
                      {/* Resumen de la cita */}
                      <div className="payment-summary">
                        <h4>Resumen de la Cita</h4>
                        <div className="summary-item">
                          <span>Especialidad:</span>
                          <strong>{especialidades.find(e => e.id_especialidad == citaEspecialidad)?.nombre}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Médico:</span>
                          <strong>{medicos.find(m => m.id_medico == citaMedico)?.nombres} {medicos.find(m => m.id_medico == citaMedico)?.apellidos}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Fecha:</span>
                          <strong>{citaFecha}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Turno:</span>
                          <strong>{citaTurno === 'manana' ? 'Mañana (7:00 AM - 12:00 PM)' : 'Tarde (2:00 PM - 7:00 PM)'}</strong>
                        </div>
                        <div className="summary-item total">
                          <span>Total a pagar:</span>
                          <strong>S/ 50.00</strong>
                        </div>
                      </div>

                      {/* Métodos de pago */}
                      <div className="payment-methods">
                        <h4>Seleccione método de pago</h4>
                        <div className="payment-options">
                          <label className={`payment-option ${metodoPago === 'tarjeta_debito' ? 'selected' : ''}`}>
                            <input
                              type="radio"
                              name="metodoPago"
                              value="tarjeta_debito"
                              checked={metodoPago === 'tarjeta_debito'}
                              onChange={(e) => setMetodoPago(e.target.value)}
                            />
                            <span>💳 Tarjeta de Débito</span>
                          </label>
                          <label className={`payment-option ${metodoPago === 'tarjeta_credito' ? 'selected' : ''}`}>
                            <input
                              type="radio"
                              name="metodoPago"
                              value="tarjeta_credito"
                              checked={metodoPago === 'tarjeta_credito'}
                              onChange={(e) => setMetodoPago(e.target.value)}
                            />
                            <span>💳 Tarjeta de Crédito</span>
                          </label>
                          <label className={`payment-option ${metodoPago === 'transferencia' ? 'selected' : ''}`}>
                            <input
                              type="radio"
                              name="metodoPago"
                              value="transferencia"
                              checked={metodoPago === 'transferencia'}
                              onChange={(e) => setMetodoPago(e.target.value)}
                            />
                            <span>🏦 Transferencia Bancaria</span>
                          </label>
                          <label className={`payment-option ${metodoPago === 'billetera_digital' ? 'selected' : ''}`}>
                            <input
                              type="radio"
                              name="metodoPago"
                              value="billetera_digital"
                              checked={metodoPago === 'billetera_digital'}
                              onChange={(e) => {
                                setMetodoPago(e.target.value);
                                setBilleteraEspecifica(''); // Reset sub-opción
                              }}
                            />
                            <span>📱 Billeteras Digitales</span>
                          </label>
                        </div>
                      </div>

                      {/* Sub-opciones de Billeteras Digitales */}
                      {metodoPago === 'billetera_digital' && (
                        <div className="payment-fields">
                          <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>Seleccione su billetera:</h4>
                          <div className="payment-options" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <label className={`payment-option ${billeteraEspecifica === 'yape' ? 'selected' : ''}`}>
                              <input
                                type="radio"
                                name="billeteraEspecifica"
                                value="yape"
                                checked={billeteraEspecifica === 'yape'}
                                onChange={(e) => setBilleteraEspecifica(e.target.value)}
                              />
                              <img src="/yape-logo.png" alt="Yape" style={{ width: '24px', height: '24px', objectFit: 'contain', marginRight: '8px' }} />
                              <span>Yape</span>
                            </label>
                            <label className={`payment-option ${billeteraEspecifica === 'plin' ? 'selected' : ''}`}>
                              <input
                                type="radio"
                                name="billeteraEspecifica"
                                value="plin"
                                checked={billeteraEspecifica === 'plin'}
                                onChange={(e) => setBilleteraEspecifica(e.target.value)}
                              />
                              <img src="/plin-logo.png" alt="Plin" style={{ width: '24px', height: '24px', objectFit: 'contain', marginRight: '8px' }} />
                              <span>Plin</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Campos adicionales según método de pago */}
                      {(metodoPago === 'tarjeta_debito' || metodoPago === 'tarjeta_credito') && (
                        <div className="payment-fields">
                          <div className="form-group">
                            <label>Número de Tarjeta</label>
                            <input
                              type="text"
                              placeholder="0000 0000 0000 0000"
                              value={numeroTarjeta}
                              onChange={(e) => {
                                // Formato simple para tarjeta
                                const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                const match = val.match(/.{1,4}/g);
                                setNumeroTarjeta(match ? match.join(' ') : val);
                              }}
                              maxLength="19"
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                              <label>Fecha de Expiración</label>
                              <input
                                type="text"
                                placeholder="MM/AA"
                                value={fechaExpiracion}
                                onChange={(e) => {
                                  // Formato MM/AA
                                  let val = e.target.value.replace(/\D/g, '');
                                  if (val.length >= 2) {
                                    val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                  }
                                  setFechaExpiracion(val);
                                }}
                                maxLength="5"
                              />
                            </div>
                            <div className="form-group">
                              <label>CVV</label>
                              <input
                                type="password"
                                placeholder="123"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                maxLength="3"
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Nombre del Titular</label>
                            <input
                              type="text"
                              placeholder="Como aparece en la tarjeta"
                              value={nombreTitular}
                              onChange={(e) => setNombreTitular(e.target.value.toUpperCase())}
                            />
                          </div>
                        </div>
                      )}

                      {/* Campos específicos para Yape y Plin */}
                      {metodoPago === 'billetera_digital' && (billeteraEspecifica === 'yape' || billeteraEspecifica === 'plin') && (
                        <div className="payment-fields">
                          <div className="form-group">
                            <label>Código de Aprobación</label>
                            <input
                              type="text"
                              placeholder="Ingrese el código de aprobación"
                              value={codigoAprobacion}
                              onChange={(e) => setCodigoAprobacion(e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label>Escanea el código QR para pagar con {billeteraEspecifica === 'yape' ? 'Yape' : 'Plin'}</label>
                            <div style={{
                              marginTop: '12px',
                              padding: '20px',
                              background: 'white',
                              borderRadius: '12px',
                              display: 'inline-block',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                  billeteraEspecifica === 'yape'
                                    ? 'yape://pago/sisol/50.00'
                                    : 'plin://pago/sisol/50.00'
                                )}`}
                                alt={`Código QR ${billeteraEspecifica === 'yape' ? 'Yape' : 'Plin'}`}
                                style={{ width: '200px', height: '200px', display: 'block' }}
                              />
                              <p style={{
                                marginTop: '12px',
                                fontSize: '14px',
                                color: '#718096',
                                fontWeight: '600'
                              }}>
                                Monto: S/ 50.00
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Campos para Transferencia (Plin ahora usa lógica de Yape) */}
                      {metodoPago === 'transferencia' && (
                        <div className="payment-fields">
                          <div className="form-group">
                            <label>Número de Transacción</label>
                            <input
                              type="text"
                              placeholder="Ingrese el número de transacción"
                              value={numeroTransaccion}
                              onChange={(e) => setNumeroTransaccion(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="payment-modal-footer">
                      <button className="btn-secondary" onClick={() => setShowPaymentModal(false)}>
                        Cancelar
                      </button>
                      <button
                        className="btn-primary"
                        onClick={handleConfirmPayment}
                        disabled={processingPayment}
                      >
                        {processingPayment ? 'Procesando...' : 'Confirmar Pago'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                  <div className="historial-item" key={cita.id_cita}>
                    <div className="historial-info">
                      <h3>{cita.especialidad}</h3>
                      <p>Dr. {cita.medico_nombre} {cita.medico_apellido}</p>
                      <p className="historial-fecha">📅 {cita.fechaFormatted} - {cita.hora_cita}</p>
                    </div>
                    <div className="historial-actions">
                      <span className={`historial-status ${cita.estado}`}>{cita.estado}</span>
                      {cita.estado === 'completada' && (
                        <button className="btn-secondary btn-sm" style={{ marginTop: '8px' }}>⬇️ Descargar Resultados</button>
                      )}
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

