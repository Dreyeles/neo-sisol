import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import './Dashboard.css';
import API_BASE_URL from '../config';
import LogoutIcon from './LogoutIcon';

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

  // Estado para resultados de laboratorio reales
  const [resultados, setResultados] = useState([]);
  const [loadingResultados, setLoadingResultados] = useState(true);

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
  const [dayAvailability, setDayAvailability] = useState(null); // Para ver disponibilidad de ambos turnos
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

  // Temporizador de pago (10 minutos = 600 segundos)
  const PAYMENT_TIMEOUT_SECONDS = 600;
  const PAYMENT_EXPIRY_KEY = 'sisol_payment_expiry';
  const [paymentTimeLeft, setPaymentTimeLeft] = useState(PAYMENT_TIMEOUT_SECONDS);
  const [timerActive, setTimerActive] = useState(false);

  // Estados para pago de Exámenes
  const [paymentType, setPaymentType] = useState('cita'); // 'cita' | 'examen'
  const [selectedExamsToPay, setSelectedExamsToPay] = useState([]);
  const [totalExamAmount, setTotalExamAmount] = useState(0);

  // Filtros Resultados
  const [filterDate, setFilterDate] = useState('');
  const [filterService, setFilterService] = useState('');

  // Filtros Historial
  const [filterHistorialDate, setFilterHistorialDate] = useState('');
  const [filterHistorialSpecialty, setFilterHistorialSpecialty] = useState('');

  // Estado para completar perfil
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
    distrito: user?.distrito || '',
    provincia: user?.provincia || '',
    departamento: user?.departamento || 'Lima',
    fecha_nacimiento: user?.fecha_nacimiento || '',
    genero: user?.genero || '',
    contacto_emergencia_nombre: user?.contacto_emergencia_nombre || '',
    contacto_emergencia_telefono: user?.contacto_emergencia_telefono || '',
    contacto_emergencia_relacion: user?.contacto_emergencia_relacion || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const isProfileComplete = () => {
    return !!(
      user?.telefono &&
      user?.direccion &&
      user?.provincia &&
      user?.fecha_nacimiento &&
      user?.genero &&
      user?.contacto_emergencia_nombre &&
      user?.contacto_emergencia_telefono
    );
  };

  // Cargar especialidades desde la API
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/especialidades`);
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

  // Efecto para recuperar el temporizador al cargar o abrir el modal
  useEffect(() => {
    const expiry = localStorage.getItem(PAYMENT_EXPIRY_KEY);
    if (expiry) {
      const timeLeft = Math.max(0, Math.floor((parseInt(expiry) - Date.now()) / 1000));
      if (timeLeft > 0) {
        setPaymentTimeLeft(timeLeft);
        if (showPaymentModal) setTimerActive(true);
      } else {
        localStorage.removeItem(PAYMENT_EXPIRY_KEY);
        setPaymentTimeLeft(PAYMENT_TIMEOUT_SECONDS);
      }
    }
  }, [showPaymentModal]);

  // Control del temporizador de pago
  useEffect(() => {
    let timer;
    if (timerActive) {
      timer = setInterval(() => {
        const expiry = localStorage.getItem(PAYMENT_EXPIRY_KEY);
        if (expiry) {
          const timeLeft = Math.max(0, Math.floor((parseInt(expiry) - Date.now()) / 1000));
          setPaymentTimeLeft(timeLeft);

          if (timeLeft <= 0) {
            setTimerActive(false);
            setShowPaymentModal(false);
            localStorage.removeItem(PAYMENT_EXPIRY_KEY);
            alert('La sesión de pago ha expirado. Por favor, intente nuevamente.');
          }
        } else {
          // Si no hay expiry en localStorage pero el timer está activo, algo está mal
          setTimerActive(false);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerActive]);

  // Cargar citas reales del paciente
  // Efecto para verificar perfil al entrar a agendar
  useEffect(() => {
    if (activeSection === 'agendar' && !isProfileComplete()) {
      console.log('Perfil incompleto detectado al entrar a Agendar. Mostrando modal.');
      setShowCompleteProfileModal(true);
    }
  }, [activeSection, user]);

  const fetchCitas = async (silent = false) => {
    // Si no hay ID de paciente, no intentamos cargar y quitamos el loading
    if (!user?.id_paciente) {
      setLoadingCitas(false);
      return;
    }

    if (!silent) setLoadingCitas(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/citas/paciente/${user.id_paciente}`);

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
      if (!silent) setLoadingCitas(false);
    }
  };

  const fetchResultados = async (silent = false) => {
    if (!user?.id_paciente) {
      setLoadingResultados(false);
      return;
    }

    if (!silent) setLoadingResultados(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/archivos/paciente/${user.id_paciente}`);
      const data = await response.json();

      if (data.status === 'OK') {
        setResultados(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar resultados:', error);
      setResultados([]);
    } finally {
      if (!silent) setLoadingResultados(false);
    }
  };

  useEffect(() => {
    console.log('Usuario actual en Dashboard:', user);
    if (user?.id_paciente) {
      console.log('Buscando citas para paciente ID:', user.id_paciente);
      fetchCitas();
      fetchResultados();

      // Configurar refresco automático cada 30 segundos
      const intervalId = setInterval(() => {
        console.log('🔄 Actualizando datos en segundo plano...');
        fetchCitas(true);
        fetchResultados(true);
      }, 30000);

      // Refrescar cuando el usuario vuelve a enfocar la ventana/pestaña
      const handleFocus = () => {
        console.log('🪟 Ventana enfocada, refrescando datos...');
        fetchCitas(true);
        fetchResultados(true);
      };

      window.addEventListener('focus', handleFocus);

      // Limpieza al desmontar el componente o cambiar de usuario
      return () => {
        clearInterval(intervalId);
        window.removeEventListener('focus', handleFocus);
      };
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
        const response = await fetch(`${API_BASE_URL}/api/medicos/por-especialidad/${citaEspecialidad}`);
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

  // Cargar disponibilidad de todo el día cuando cambia el médico o la fecha
  useEffect(() => {
    if (!citaMedico || !citaFecha) {
      setDayAvailability(null);
      return;
    }

    const fetchDayAvailability = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/citas/check-full-day-availability`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_medico: citaMedico, fecha: citaFecha })
        });
        const data = await response.json();
        if (data.status === 'OK') {
          setDayAvailability(data.availability);
        }
      } catch (error) {
        console.error('Error al cargar disponibilidad del día:', error);
      }
    };

    fetchDayAvailability();
  }, [citaMedico, citaFecha]);

  // Verificar disponibilidad cuando cambian los datos requeridos
  useEffect(() => {
    if (!citaMedico || !citaFecha || !citaTurno) {
      setAvailability(null);
      return;
    }

    const checkAvailability = async () => {
      // Validar si es domingo de forma robusta
      if (!citaFecha) return;
      const [year, month, day] = citaFecha.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      if (dateObj.getDay() === 0) {
        setAvailability({
          available: false,
          message: 'Los domingos no hay atención. Por favor elija un día de Lunes a Sábado.',
          sugerencia: null
        });
        setCheckingAvailability(false);
        return;
      }

      setCheckingAvailability(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/citas/check-availability`, {
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
            message: data.message,
            cuposRestantes: data.cuposRestantes,
            sugerencia: data.sugerencia
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

    if (!isProfileComplete()) {
      setShowCompleteProfileModal(true);
      return;
    }

    // Doble verificación de domingo
    const [year, month, day] = citaFecha.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    if (dateObj.getDay() === 0) {
      alert('Lo sentimos, los domingos no hay atención. Por favor seleccione otro día.');
      return;
    }

    if (availability && availability.available) {
      // Configurar modal para CITA e iniciar temporizador
      setPaymentType('cita');

      // Persistencia del temporizador
      let expiry = localStorage.getItem(PAYMENT_EXPIRY_KEY);
      if (!expiry) {
        expiry = (Date.now() + (PAYMENT_TIMEOUT_SECONDS * 1000)).toString();
        localStorage.setItem(PAYMENT_EXPIRY_KEY, expiry);
      }

      const timeLeft = Math.max(0, Math.floor((parseInt(expiry) - Date.now()) / 1000));
      setPaymentTimeLeft(timeLeft);
      setTimerActive(true);
      setShowPaymentModal(true);
    }
  };

  const handlePayExams = (cita) => {
    try {
      if (!cita.examenes_solicitados) return;
      const exams = JSON.parse(cita.examenes_solicitados);
      if (Array.isArray(exams) && exams.length > 0) {
        const total = exams.reduce((sum, ex) => sum + (parseFloat(ex.costo) || 0), 0);
        setSelectedExamsToPay(exams);
        setTotalExamAmount(total);
        setPaymentType('examen');
        setShowPaymentModal(true);
      }
    } catch (e) {
      console.error("Error parsing exams:", e);
      alert("Error al cargar detalles de los exámenes.");
    }
  };

  const generarPDF = (cita) => {
    const doc = new jsPDF();
    const fecha = cita.fechaFormatted || new Date().toLocaleDateString();

    // Cabecera
    doc.setFillColor(0, 139, 133); // Color Neo SISOL (Teal)
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Neo SISOL", 15, 13);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Sistema Integral de Salud Online", 150, 13);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME DE ATENCIÓN", 105, 40, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.line(20, 45, 190, 45);

    doc.setFont("helvetica", "bold"); doc.text("Fecha:", 20, 55);
    doc.setFont("helvetica", "normal"); doc.text(fecha, 50, 55);

    doc.setFont("helvetica", "bold"); doc.text("Paciente:", 20, 62);
    const nombrePaciente = `${user?.nombres || user?.nombre || "Paciente"} ${user?.apellidos || ""} `.trim();
    doc.setFont("helvetica", "normal"); doc.text(nombrePaciente, 50, 62);

    doc.setFont("helvetica", "bold"); doc.text("Médico:", 120, 62);
    doc.setFont("helvetica", "normal"); doc.text(`Dr.${cita.medico_nombre || ''} ${cita.medico_apellido || ''} `.trim(), 140, 62);

    doc.line(20, 75, 190, 75);

    let yPos = 90;
    const renderStructuredSection = (titulo, contenidoRaw, yStart) => {
      if (!contenidoRaw) return yStart;

      doc.setFont("helvetica", "bold"); doc.text(titulo + ":", 20, yStart);
      yStart += 5;
      doc.setFont("helvetica", "normal");

      let isJson = false;
      let data = [];
      try {
        data = JSON.parse(contenidoRaw);
        if (Array.isArray(data)) isJson = true;
      } catch (e) { isJson = false; }

      if (isJson) {
        data.forEach(item => {
          doc.text(`• ${item} `, 25, yStart);
          yStart += 5;
        });
        yStart += 5;
      } else {
        const lineas = doc.splitTextToSize(contenidoRaw, 170);
        doc.text(lineas, 20, yStart);
        yStart += (lineas.length * 5) + 5;
      }
      return yStart + 5;
    };

    // Renderizar secciones dinámicas
    yPos = renderStructuredSection("Motivo", cita.motivo_consulta, yPos);
    yPos = renderStructuredSection("Diagnóstico", cita.diagnostico, yPos);
    yPos = renderStructuredSection("Tratamiento / Indicaciones", cita.tratamiento, yPos);
    // Receta se maneja especial abajo
    yPos = renderStructuredSection("Observaciones", cita.observaciones, yPos);

    // Manejo especial para Receta Médica (Tabla)
    if (cita.receta_medica) {
      doc.setFont("helvetica", "bold"); doc.text("Receta Médica:", 20, yPos);
      yPos += 7;

      let isJsonReceta = false;
      let recetaData = [];
      try {
        recetaData = JSON.parse(cita.receta_medica);
        if (Array.isArray(recetaData)) isJsonReceta = true;
      } catch (e) { isJsonReceta = false; }

      if (isJsonReceta) {
        // Cabecera de Tabla
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPos, 170, 8, 'F');
        doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        doc.text("Medicamento / Dosis", 22, yPos + 5);
        doc.text("Indicaciones (Frecuencia/Duración)", 100, yPos + 5);
        yPos += 10;

        doc.setFont("helvetica", "normal");
        recetaData.forEach((med, idx) => {
          const nombreDosis = `${med.nombre} ${med.dosis} `;
          const indica = `${med.frecuencia} - ${med.duracion} ${med.notas ? '(' + med.notas + ')' : ''} `;

          doc.text(`• ${nombreDosis} `, 22, yPos);
          const splitIndica = doc.splitTextToSize(indica, 85);
          doc.text(splitIndica, 100, yPos);

          yPos += (splitIndica.length * 5) + 3;
        });
      } else {
        // Texto plano legacy
        doc.setFont("helvetica", "normal"); doc.setFontSize(10);
        const lineas = doc.splitTextToSize(cita.receta_medica, 170);
        doc.text(lineas, 20, yPos);
      }
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Generado por Neo SISOL", 105, 280, { align: "center" });
    doc.save(`SISOL_Informe_${fecha.replace(/\//g, '-')}.pdf`);
  };

  const handleConfirmPayment = async () => {
    if (!metodoPago) {
      alert('Por favor seleccione un método de pago');
      return;
    }

    if (paymentTimeLeft <= 0) {
      alert('El tiempo ha expirado. Por favor, inicie el proceso de nuevo.');
      setShowPaymentModal(false);
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

      const response = await fetch(`${API_BASE_URL}/api/pagos/procesar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === 'OK') {
        alert(paymentType === 'cita' ? '¡Pago procesado y cita agendada con éxito!' : '¡Pago de exámenes registrado con éxito!');
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
        localStorage.removeItem(PAYMENT_EXPIRY_KEY);
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

  const filteredResultados = resultados.filter(item => {
    const matchDate = filterDate ? item.fecha_subida.startsWith(filterDate) : true;
    const matchService = filterService ? (
      item.tipo_documento.toLowerCase().includes(filterService.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(filterService.toLowerCase())
    ) : true;
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
      {/* Header para móviles */}
      <header className="mobile-dashboard-header">
        <img src="/logo.svg" alt="Neo SISOL" className="mobile-logo" />
        <button className="mobile-logout-btn" onClick={onLogout}>
          <LogoutIcon size={20} />
        </button>
      </header>

      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src="/logo.svg" alt="Neo SISOL" className="sidebar-logo" />
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === 'citas' ? 'active' : ''}`}
            onClick={() => setActiveSection('citas')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Mis Citas
          </button>
          <button
            className={`nav-item ${activeSection === 'agendar' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('agendar');
              if (!isProfileComplete()) {
                setShowCompleteProfileModal(true);
              }
            }}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Agendar Cita
          </button>
          <button
            className={`nav-item ${activeSection === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveSection('perfil')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Mi Perfil
          </button>
          <button
            className={`nav-item ${activeSection === 'historial' ? 'active' : ''}`}
            onClick={() => setActiveSection('historial')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Historial
          </button>
          <button
            className={`nav-item ${activeSection === 'resultados' ? 'active' : ''}`}
            onClick={() => setActiveSection('resultados')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 22s1-4 4-4 5 0 5 0 1 4 4 4 4-4 4-4"></path>
              <path d="M12 18V2"></path>
              <circle cx="12" cy="7" r="5"></circle>
            </svg>
            Resultados
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-button" onClick={onLogout}>
            <LogoutIcon size={18} /> Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <header className="dashboard-header-modern">
          <div className="header-info">
            <h1>¡Hola, {user?.nombres || user?.nombre || 'Paciente'}!</h1>
            <p>
              {proximasCitas.length > 0
                ? `Tienes ${proximasCitas.length} citas programadas para tus próximos controles.`
                : 'Tu salud es lo primero. Registra una cita para tu chequeo preventivo.'}
            </p>
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
                        <p className="cita-fecha">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          {cita.fechaFormatted} - {cita.hora_cita}
                        </p>
                      </div>
                      <div className="cita-actions">
                        <span className={`historial-status ${cita.estado}`}>{cita.estado}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <p className="empty-state-title">No tienes citas programadas</p>
                    <p className="empty-state-description">Tu historial preventivo es la mejor medicina. Agenda una cita hoy.</p>
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
                    <option value="manana">Mañana (7:00 AM - 1:00 PM)</option>
                    <option value="tarde">Tarde (2:00 PM - 7:00 PM)</option>
                  </select>
                </div>

                {/* Mensaje de disponibilidad */}
                {checkingAvailability && <p className="status-checking">Verificando disponibilidad...</p>}
                {!checkingAvailability && availability && (
                  <div className={`availability-message ${availability.available ? 'success' : 'error'}`}>
                    {availability.message}
                    {availability.sugerencia && !availability.available && (
                      <div className="availability-suggestion">
                        <p>{availability.sugerencia.mensaje}</p>
                        <button
                          type="button"
                          className="btn-suggestion"
                          onClick={() => setCitaTurno(availability.sugerencia.turno)}
                        >
                          Cambiar a turno {availability.sugerencia.turno}
                        </button>
                      </div>
                    )}
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
                      <div className="payment-timer">
                        <span className="timer-label">Tiempo restante:</span>
                        <span className={`timer-clock ${paymentTimeLeft < 60 ? 'warning' : ''}`}>
                          {Math.floor(paymentTimeLeft / 60)}:{(paymentTimeLeft % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <button className="close-modal" onClick={() => {
                        setShowPaymentModal(false);
                        setTimerActive(false);
                      }}>✕</button>
                    </div>

                    <div className="payment-modal-body">
                      {/* Resumen de la cita o Exámenes */}
                      <div className="payment-summary">
                        {paymentType === 'cita' ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <h4>Resumen de Exámenes</h4>
                            {selectedExamsToPay.map((ex, idx) => (
                              <div className="summary-item" key={idx} style={{ fontSize: '13px' }}>
                                <span>{ex.servicio}:</span>
                                <strong>S/ {parseFloat(ex.costo).toFixed(2)}</strong>
                              </div>
                            ))}
                            <div className="summary-item total" style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px dashed #ccc' }}>
                              <span>Total a pagar:</span>
                              <strong>S/ {totalExamAmount.toFixed(2)}</strong>
                            </div>
                          </>
                        )}
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
                                alt={`Código QR ${billeteraEspecifica === 'yape' ? 'Yape' : 'Plin'} `}
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
                      <button className="btn-secondary" onClick={() => {
                        setShowPaymentModal(false);
                        setTimerActive(false);
                      }}>
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

              {/* Modal de Completar Perfil */}
              {showCompleteProfileModal && (
                <div className="payment-modal-overlay">
                  <div className="payment-modal" style={{ maxWidth: '600px' }}>
                    <div className="payment-modal-header">
                      <h3>📋 Completar Información</h3>
                      <button className="close-modal" onClick={() => setShowCompleteProfileModal(false)}>✕</button>
                    </div>
                    <div className="payment-modal-body">
                      <p style={{ marginBottom: '20px', color: '#666' }}>Para agendar tu primera cita, necesitamos algunos datos adicionales de salud y contacto.</p>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Teléfono Celular</label>
                          <input
                            type="tel"
                            placeholder="987654321"
                            value={profileData.telefono}
                            maxLength={9}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              if (val.length <= 9) {
                                setProfileData({ ...profileData, telefono: val });
                              }
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Género</label>
                          <select
                            value={profileData.genero}
                            onChange={(e) => setProfileData({ ...profileData, genero: e.target.value })}
                          >
                            <option value="">Seleccione</option>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Fecha de Nacimiento</label>
                          <input
                            type="date"
                            value={profileData.fecha_nacimiento ? profileData.fecha_nacimiento.split('T')[0] : ''}
                            onChange={(e) => setProfileData({ ...profileData, fecha_nacimiento: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Dirección</label>
                          <input
                            type="text"
                            placeholder="Av. Las Magnolias 123"
                            value={profileData.direccion}
                            onChange={(e) => setProfileData({ ...profileData, direccion: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Provincia</label>
                          <select
                            value={profileData.provincia}
                            onChange={(e) => setProfileData({ ...profileData, provincia: e.target.value })}
                          >
                            <option value="">Seleccione</option>
                            <option value="Lima Metropolitana">Lima Metropolitana</option>
                            <option value="Callao">Callao</option>
                            {/* Otros departamentos... */}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Distrito</label>
                          <input
                            type="text"
                            placeholder="Ej: Miraflores"
                            value={profileData.distrito}
                            onChange={(e) => setProfileData({ ...profileData, distrito: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-section-divider">
                        <span>Contacto de Emergencia</span>
                      </div>

                      <div className="form-group">
                        <label>Nombre Completo</label>
                        <input
                          type="text"
                          value={profileData.contacto_emergencia_nombre}
                          onChange={(e) => setProfileData({ ...profileData, contacto_emergencia_nombre: e.target.value })}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Teléfono</label>
                          <input
                            type="tel"
                            maxLength={9}
                            placeholder="999888777"
                            value={profileData.contacto_emergencia_telefono}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 9) {
                                setProfileData({ ...profileData, contacto_emergencia_telefono: value });
                              }
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Relación</label>
                          <input
                            type="text"
                            placeholder="Ej: Padre, Madre, Cónyuge"
                            value={profileData.contacto_emergencia_relacion}
                            onChange={(e) => setProfileData({ ...profileData, contacto_emergencia_relacion: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="payment-modal-footer">
                      <button className="btn-secondary" onClick={() => setShowCompleteProfileModal(false)}>Cancelar</button>
                      <button
                        className="btn-primary"
                        disabled={savingProfile}
                        onClick={async () => {
                          if (!profileData.telefono || !profileData.direccion || !profileData.genero || !profileData.fecha_nacimiento || !profileData.contacto_emergencia_nombre || !profileData.contacto_emergencia_telefono) {
                            alert('Por favor complete todos los campos obligatorios.');
                            return;
                          }

                          if (profileData.telefono.length !== 9) {
                            alert('El número de celular debe tener exactamente 9 dígitos.');
                            return;
                          }

                          if (profileData.contacto_emergencia_telefono.length !== 9) {
                            alert('El número de contacto de emergencia debe tener exactamente 9 dígitos.');
                            return;
                          }
                          setSavingProfile(true);
                          try {
                            const dataToSend = {
                              ...profileData,
                              fecha_nacimiento: profileData.fecha_nacimiento ? profileData.fecha_nacimiento.split('T')[0] : null
                            };
                            const res = await fetch(`${API_BASE_URL}/api/pacientes/${user.id_paciente}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(dataToSend)
                            });
                            const data = await res.json();
                            if (data.status === 'OK') {
                              alert('Perfil actualizado con éxito. Ahora puedes agendar tu cita.');
                              // Actualizar el objeto user en el padre/estado local
                              Object.assign(user, profileData);
                              setShowCompleteProfileModal(false);
                            } else {
                              alert('Error: ' + (data.details || data.message));
                            }
                          } catch (err) {
                            console.error(err);
                            alert('Error al conectar con el servidor');
                          } finally {
                            setSavingProfile(false);
                          }
                        }}
                      >
                        {savingProfile ? 'Guardando...' : 'Guardar y Continuar'}
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
                  <h3>{user?.nombres || user?.nombre || 'Paciente'}</h3>
                </div>
                <div className="perfil-info-grid">
                  <div className="info-item-modern">
                    <label>Email Corporativo</label>
                    <span>{user?.email || 'usuario@email.com'}</span>
                  </div>
                  <div className="info-item-modern">
                    <label>Teléfono de Contacto</label>
                    <span>+51 999 999 999</span>
                  </div>
                  <div className="info-item-modern">
                    <label>DNI / Identificación</label>
                    <span>12345678</span>
                  </div>
                  <div className="info-item-modern">
                    <label>Fecha de Nacimiento</label>
                    <span>01/01/1990</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'historial' && (
            <div className="section-content">
              <h2>Historial de Citas</h2>

              <div className="filters-container-modern">
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
                      <p className="historial-fecha">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {cita.fechaFormatted} - {cita.hora_cita}
                      </p>
                    </div>
                    <div className="historial-actions">
                      <span className={`historial-status ${cita.estado}`}>{cita.estado}</span>
                      {cita.estado === 'completada' && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() => generarPDF(cita)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            Descargar Informe
                          </button>
                          {cita.examenes_solicitados && cita.examenes_solicitados.length > 5 && (
                            <button
                              className="btn-primary btn-sm"
                              onClick={() => handlePayExams(cita)}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', background: '#e53e3e', borderColor: '#e53e3e' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                              </svg>
                              Pagar Exámenes
                            </button>
                          )}
                        </div>
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

              <div className="filters-container-modern">
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
                {loadingResultados ? (
                  <p>Cargando resultados...</p>
                ) : filteredResultados.length > 0 ? (
                  filteredResultados.map(resultado => (
                    <div className="historial-item" key={resultado.id_archivo}>
                      <div className="historial-info">
                        <h3>{resultado.tipo_documento}</h3>
                        <p>{resultado.descripcion || 'Sin descripción adicional'}</p>
                        <p className="historial-fecha">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          {new Date(resultado.fecha_subida).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <a
                        href={`${API_BASE_URL}${resultado.ruta_archivo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Descargar
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                    </div>
                    <p className="empty-state-title">No hay ningún resultado todavía</p>
                    <p className="empty-state-description">Aquí aparecerán tus resultados de laboratorio e imagenología una vez que el médico los suba.</p>
                  </div>
                )}

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

      {/* Menú inferior para móviles */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-item ${activeSection === 'citas' ? 'active' : ''}`}
          onClick={() => setActiveSection('citas')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Citas</span>
        </button>
        <button
          className={`mobile-nav-item ${activeSection === 'agendar' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('agendar');
            if (!isProfileComplete()) {
              setShowCompleteProfileModal(true);
            }
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span>Agendar</span>
        </button>
        <button
          className={`mobile-nav-item ${activeSection === 'historial' ? 'active' : ''}`}
          onClick={() => setActiveSection('historial')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <span>Historial</span>
        </button>
        <button
          className={`mobile-nav-item ${activeSection === 'resultados' ? 'active' : ''}`}
          onClick={() => setActiveSection('resultados')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <span>Resultados</span>
        </button>
        <button
          className={`mobile-nav-item ${activeSection === 'perfil' ? 'active' : ''}`}
          onClick={() => setActiveSection('perfil')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Perfil</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;

