import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
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
    const [previousVitals, setPreviousVitals] = useState(null);
    const [existingBloodType, setExistingBloodType] = useState(null);
    const [consultaForm, setConsultaForm] = useState({
        peso: '',
        talla: '',
        presion_arterial: '',
        temperatura: '',
        grupo_sanguineo: '',
        alergias: '',
        enfermedades_cronicas: '',
        cirugias_previas: '',
        medicamentos_actuales: '',
        antecedentes_familiares: '',
        antecedentes_personales: '',
        vacunas: '',
        motivo_consulta: '',
        sintomas: '',
        diagnostico: '',
        observaciones: '',
        tratamiento: '',
        receta_medica: '',
        proxima_cita: ''
    });

    const handleConsultaChange = (e) => {
        const { name, value } = e.target;
        setConsultaForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const [medicamentosList, setMedicamentosList] = useState([]);
    const [nuevoMedicamento, setNuevoMedicamento] = useState({ nombre: '', dosis: '', frecuencia: '', duracion: '', notas: '' });

    // Listas estructuradas para Diagnóstico y Tratamiento
    const [diagnosticosList, setDiagnosticosList] = useState([]);
    const [nuevoDiagnostico, setNuevoDiagnostico] = useState('');
    const [tratamientosList, setTratamientosList] = useState([]);
    const [nuevoTratamiento, setNuevoTratamiento] = useState('');

    const handleAgregarDiagnostico = () => {
        if (nuevoDiagnostico.trim()) {
            setDiagnosticosList([...diagnosticosList, nuevoDiagnostico.trim()]);
            setNuevoDiagnostico('');
        }
    };

    const handleEliminarDiagnostico = (idx) => {
        const list = [...diagnosticosList];
        list.splice(idx, 1);
        setDiagnosticosList(list);
    };

    const handleAgregarTratamiento = () => {
        if (nuevoTratamiento.trim()) {
            setTratamientosList([...tratamientosList, nuevoTratamiento.trim()]);
            setNuevoTratamiento('');
        }
    };

    const handleEliminarTratamiento = (idx) => {
        const list = [...tratamientosList];
        list.splice(idx, 1);
        setTratamientosList(list);
    };

    const handleAgregarMedicamento = () => {
        if (!nuevoMedicamento.nombre || !nuevoMedicamento.dosis || !nuevoMedicamento.frecuencia) {
            alert("Por favor complete nombre, dosis y frecuencia.");
            return;
        }
        setMedicamentosList([...medicamentosList, nuevoMedicamento]);
        setNuevoMedicamento({ nombre: '', dosis: '', frecuencia: '', duracion: '', notas: '' });
    };

    const handleEliminarMedicamento = (index) => {
        const nuevaLista = [...medicamentosList];
        nuevaLista.splice(index, 1);
        setMedicamentosList(nuevaLista);
    };

    const handleIniciarConsulta = async (cita) => {
        setConsultaActual(cita);

        // Reset base states
        setPreviousVitals(null);
        setExistingBloodType(null);
        setExamenesAgregados([]);
        setMedicamentosList([]); // Reset medicamentos
        setDiagnosticosList([]); // Reset
        setTratamientosList([]); // Reset
        setSolicitarExamen(false);
        setConsultaStep(1);

        // Fetch patient data for context
        try {
            // Obtain blood type from profile
            const profileResp = await fetch(`http://localhost:5000/api/pacientes/perfil-medico/${cita.id_paciente}`);
            const profileData = await profileResp.json();

            // Obtain history for previous vitals
            const historyResp = await fetch(`http://localhost:5000/api/atencion/historial/${cita.id_paciente}`);
            const historyData = await historyResp.json();

            let bloodType = '';
            let prevVitals = null;
            let historial = {};

            if (profileData.status === 'OK') {
                bloodType = profileData.data.grupo_sanguineo || '';
                setExistingBloodType(bloodType);
                historial = profileData.data.historial_medico || {};
            }

            if (historyData.status === 'OK' && historyData.data.length > 0) {
                // Assuming first item is latest due to DESC order
                const latest = historyData.data[0];
                let signs = latest.signos_vitales;
                // Parse if string (though usually object if JSON column)
                if (typeof signs === 'string') {
                    try { signs = JSON.parse(signs); } catch (e) { }
                }
                prevVitals = signs;
            }
            setPreviousVitals(prevVitals);

            setConsultaForm(prev => ({
                ...prev,
                motivo_consulta: cita.motivo_consulta || '',
                // Prefill blood type if exists
                grupo_sanguineo: bloodType,

                // Clear vitals for new entry
                peso: '', talla: '', presion_arterial: '', temperatura: '',

                // Other fields
                alergias: profileData.data?.alergias || '',
                enfermedades_cronicas: historial.enfermedades_cronicas || '',
                cirugias_previas: historial.cirugias_previas || '',
                medicamentos_actuales: historial.medicamentos_actuales || '',
                antecedentes_familiares: historial.antecedentes_familiares || '',
                antecedentes_personales: historial.antecedentes_personales || '',
                vacunas: historial.vacunas || '',

                sintomas: '', diagnostico: '', observaciones: '',
                tratamiento: '', receta_medica: '', proxima_cita: ''
            }));

            setShowConsultaModal(true);

        } catch (error) {
            console.error("Error fetching patient details for consultation:", error);
            alert("Error al cargar datos del paciente. Intente nuevamente.");
        }
    };

    const handleVerHistoria = () => {
        alert("El paciente no cuenta con una historia clínica registrada en el sistema aún.");
    };

    const [showHistorialModal, setShowHistorialModal] = useState(false);
    const [historialData, setHistorialData] = useState([]);
    const [pacienteHistorial, setPacienteHistorial] = useState(null);

    const handleVerHistorialPaciente = async (paciente) => {
        // Soporte para cuando se pasa solo el ID o el objeto completo
        const id_paciente = paciente.id_paciente || paciente;
        const pacienteObj = typeof paciente === 'object' ? paciente : { id_paciente: id_paciente, nombres: 'Paciente', apellidos: '' };

        setPacienteHistorial(pacienteObj);

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

    const generarPDF = (atencion, tipo) => {
        const doc = new jsPDF();
        const pacienteNombre = `${pacienteHistorial?.nombres || 'Paciente'} ${pacienteHistorial?.apellidos || ''}`;
        const fecha = new Date(atencion.fecha_atencion).toLocaleDateString();
        const hora = new Date(atencion.fecha_atencion).toLocaleTimeString();

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
        doc.text(tipo === 'receta' ? "RECETA MÉDICA" : "INFORME DE ATENCIÓN", 105, 40, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.line(20, 45, 190, 45);

        doc.setFont("helvetica", "bold"); doc.text("Fecha:", 20, 55);
        doc.setFont("helvetica", "normal"); doc.text(`${fecha} - ${hora}`, 50, 55);

        doc.setFont("helvetica", "bold"); doc.text("Paciente:", 20, 62);
        doc.setFont("helvetica", "normal"); doc.text(pacienteNombre, 50, 62);

        doc.setFont("helvetica", "bold"); doc.text("DNI:", 20, 69);
        doc.setFont("helvetica", "normal"); doc.text(pacienteHistorial?.dni || '-', 50, 69);

        doc.setFont("helvetica", "bold"); doc.text("Médico:", 120, 62);
        doc.setFont("helvetica", "normal"); doc.text(`Dr. ${atencion.medico_nombre || ''} ${atencion.medico_apellido || ''}`, 140, 62);

        doc.line(20, 75, 190, 75);

        let yPos = 90;

        if (tipo === 'informe') {
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
                        doc.text(`• ${item}`, 25, yStart);
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
            yPos = renderStructuredSection("Motivo", atencion.motivo_consulta, yPos);
            yPos = renderStructuredSection("Diagnóstico", atencion.diagnostico, yPos);
            yPos = renderStructuredSection("Tratamiento / Indicaciones", atencion.tratamiento, yPos);

            // Observaciones sigue siendo texto plano mayormente, pero usamos el helper por consistencia
            if (atencion.observaciones) {
                yPos = renderStructuredSection("Observaciones", atencion.observaciones, yPos);
            }

            // Manejo especial para Receta Médica (Tabla)
            if (atencion.receta_medica) {
                doc.setFont("helvetica", "bold"); doc.text("Receta Médica:", 20, yPos);
                yPos += 7;

                let isJsonReceta = false;
                let recetaData = [];
                try {
                    recetaData = JSON.parse(atencion.receta_medica);
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
                        const nombreDosis = `${med.nombre} ${med.dosis}`;
                        const indica = `${med.frecuencia} - ${med.duracion} ${med.notas ? '(' + med.notas + ')' : ''}`;

                        doc.text(`• ${nombreDosis}`, 22, yPos);
                        const splitIndica = doc.splitTextToSize(indica, 85);
                        doc.text(splitIndica, 100, yPos);

                        yPos += (splitIndica.length * 5) + 3;
                    });
                    yPos += 5;
                } else {
                    // Texto plano legacy
                    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
                    const lineas = doc.splitTextToSize(atencion.receta_medica, 170);
                    doc.text(lineas, 20, yPos);
                    yPos += (lineas.length * 5) + 10;
                }
            }

        } else {
            // Formato RECETA SOLA
            doc.setFont("helvetica", "bold"); doc.text("Rp:", 20, yPos);
            doc.setFont("helvetica", "normal");

            let isJsonReceta = false;
            let recetaData = [];
            try {
                recetaData = JSON.parse(atencion.receta_medica);
                if (Array.isArray(recetaData)) isJsonReceta = true;
            } catch (e) { isJsonReceta = false; }

            if (isJsonReceta) {
                yPos += 10;
                recetaData.forEach((med, idx) => {
                    doc.setFont("helvetica", "bold");
                    doc.text(`${idx + 1}. ${med.nombre} ${med.dosis}`, 25, yPos);
                    yPos += 6;
                    doc.setFont("helvetica", "normal");
                    doc.text(`    Tomar: ${med.frecuencia} durante ${med.duracion}`, 25, yPos);
                    if (med.notas) {
                        yPos += 5;
                        doc.setFont("helvetica", "italic"); doc.setFontSize(9);
                        doc.text(`    Nota: ${med.notas}`, 25, yPos);
                        doc.setFont("helvetica", "normal"); doc.setFontSize(10);
                    }
                    yPos += 10;
                });
            } else {
                const lineas = doc.splitTextToSize(atencion.receta_medica || "Sin receta.", 170);
                doc.text(lineas, 20, yPos + 10);
                yPos += 50;
            }

            if (atencion.tratamiento) {
                yPos += 10;
                doc.setFont("helvetica", "bold"); doc.text("Indicaciones Adicionales:", 20, yPos);
                const inds = doc.splitTextToSize(atencion.tratamiento, 170);
                doc.setFont("helvetica", "normal"); doc.text(inds, 20, yPos + 7);
            }
        }

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Generado por Neo SISOL", 105, 280, { align: "center" });
        doc.save(`SISOL_${tipo}_${pacienteHistorial?.dni || 'atencion'}.pdf`);
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

    // --- ESTADOS Y FUNCIONES PARA ARCHIVOS MÉDICOS ---
    const [archivosPaciente, setArchivosPaciente] = useState([]);
    const [loadingArchivos, setLoadingArchivos] = useState(false);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [fileType, setFileType] = useState('Informe');
    const [fileDesc, setFileDesc] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);

    const fetchArchivosPaciente = async (id_paciente) => {
        setLoadingArchivos(true);
        try {
            const response = await fetch(`http://localhost:5000/api/archivos/paciente/${id_paciente}`);
            const data = await response.json();
            if (data.status === 'OK') {
                setArchivosPaciente(data.data);
            } else {
                setArchivosPaciente([]);
            }
        } catch (error) {
            console.error('Error al cargar archivos:', error);
        } finally {
            setLoadingArchivos(false);
        }
    };

    const handleFileChange = (e) => {
        setFileToUpload(e.target.files[0]);
    };

    const handleUploadArchivo = async (e) => {
        e.preventDefault();
        if (!fileToUpload || !perfilMedicoData) return;

        setUploadingFile(true);
        const formData = new FormData();
        formData.append('archivo', fileToUpload);
        formData.append('id_paciente', perfilMedicoData.id_paciente);
        formData.append('id_medico', user.id_medico);
        formData.append('tipo_documento', fileType);
        formData.append('descripcion', fileDesc);

        try {
            const response = await fetch('http://localhost:5000/api/archivos/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.status === 'OK') {
                alert('Archivo subido correctamente');
                setFileToUpload(null);
                setFileDesc('');
                // Reset input
                const fileInput = document.getElementById('fileInput');
                if (fileInput) fileInput.value = '';
                fetchArchivosPaciente(perfilMedicoData.id_paciente);
            } else {
                alert('Error al subir archivo: ' + data.message);
            }
        } catch (error) {
            console.error('Error de subida:', error);
            alert('Error al subir archivo');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleVerPerfilMedico = async (id_paciente) => {
        try {
            const response = await fetch(`http://localhost:5000/api/pacientes/perfil-medico/${id_paciente}`);
            const data = await response.json();

            if (data.status === 'OK') {
                setPerfilMedicoData(data.data);
                // Cargar archivos al abrir perfil
                fetchArchivosPaciente(id_paciente);
                setShowPerfilMedicoModal(true);
            } else {
                alert('No se pudo cargar el perfil médico: ' + data.message);
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            alert('Error al cargar perfil médico');
        }
    };

    // Lógica para Exámenes Auxiliares
    const [solicitarExamen, setSolicitarExamen] = useState(false);
    const [departamentos, setDepartamentos] = useState([]);
    const [serviciosExamen, setServiciosExamen] = useState([]);
    const [examenDepto, setExamenDepto] = useState('');
    const [examenServicio, setExamenServicio] = useState('');
    const [examenesAgregados, setExamenesAgregados] = useState([]);

    // Cargar departamentos al iniciar
    useEffect(() => {
        const fetchDepartamentos = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/servicios/departamentos');
                const data = await response.json();
                if (data.status === 'OK') {
                    setDepartamentos(data.data);
                }
            } catch (error) {
                console.error('Error al cargar departamentos:', error);
            }
        };
        fetchDepartamentos();
    }, []);

    // Cargar servicios cuando cambia el departamento
    const handleDeptoChange = async (e) => {
        const id_depto = e.target.value;
        setExamenDepto(id_depto);
        setExamenServicio(''); // Reset servicio
        if (!id_depto) {
            setServiciosExamen([]);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/servicios/por-departamento/${id_depto}`);
            const data = await response.json();
            if (data.status === 'OK') {
                setServiciosExamen(data.data);
            }
        } catch (error) {
            console.error('Error al cargar servicios:', error);
        }
    };

    const handleAgregarExamen = () => {
        if (!examenDepto || !examenServicio) return;

        const deptoNombre = departamentos.find(d => d.id_departamento == examenDepto)?.nombre;
        const servicioInfo = serviciosExamen.find(s => s.id_servicio == examenServicio);
        const servicioNombre = servicioInfo?.nombre;
        const servicioCosto = servicioInfo?.costo || 0;

        if (deptoNombre && servicioNombre) {
            // Verificar si ya existe
            const existe = examenesAgregados.some(ex => ex.id_servicio == examenServicio);
            if (!existe) {
                setExamenesAgregados([...examenesAgregados, {
                    id_departamento: examenDepto,
                    departamento: deptoNombre,
                    id_servicio: examenServicio,
                    servicio: servicioNombre,
                    costo: servicioCosto
                }]);
                // Opcional: limpiar selección
                setExamenServicio('');
            }
        }
    };

    const handleEliminarExamen = (index) => {
        const nuevosExamenes = [...examenesAgregados];
        nuevosExamenes.splice(index, 1);
        setExamenesAgregados(nuevosExamenes);
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
                    peso: consultaForm.peso,
                    talla: consultaForm.talla,
                    presion_arterial: consultaForm.presion_arterial,
                    temperatura: consultaForm.temperatura,
                    grupo_sanguineo: consultaForm.grupo_sanguineo,
                    alergias: consultaForm.alergias,
                    enfermedades_cronicas: consultaForm.enfermedades_cronicas,
                    cirugias_previas: consultaForm.cirugias_previas,
                    medicamentos_actuales: consultaForm.medicamentos_actuales,
                    antecedentes_familiares: consultaForm.antecedentes_familiares,
                    antecedentes_personales: consultaForm.antecedentes_personales,
                    vacunas: consultaForm.vacunas,
                    motivo_consulta: consultaForm.motivo_consulta,
                    sintomas: consultaForm.sintomas,
                    observaciones: consultaForm.observaciones,
                    proxima_cita: consultaForm.proxima_cita,
                    diagnostico: JSON.stringify(diagnosticosList), // Guardar como JSON
                    tratamiento: JSON.stringify(tratamientosList), // Guardar como JSON
                    receta_medica: JSON.stringify(medicamentosList),
                    examenes_solicitados: JSON.stringify(examenesAgregados)
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
                            <div className={`step ${consultaStep >= 2 ? 'active' : ''}`}>2. Antecedentes</div>
                            <div className="line"></div>
                            <div className={`step ${consultaStep >= 3 ? 'active' : ''}`}>3. Diagnóstico</div>
                            <div className="line"></div>
                            <div className={`step ${consultaStep >= 4 ? 'active' : ''}`}>4. Tratamiento</div>
                        </div>

                        <form onSubmit={handleSubmitConsulta} className="consulta-form">
                            {consultaStep === 1 && (
                                <div className="step-content">
                                    <h3>Signos Vitales</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Peso (kg) {previousVitals?.peso && <span style={{ fontSize: '0.85em', color: '#64748b', marginLeft: '5px' }}>(Ant: {previousVitals.peso})</span>}</label>
                                            <input type="number" name="peso" value={consultaForm.peso} onChange={handleConsultaChange} placeholder="Ej: 70" />
                                        </div>
                                        <div className="form-group">
                                            <label>Talla (m) {previousVitals?.talla && <span style={{ fontSize: '0.85em', color: '#64748b', marginLeft: '5px' }}>(Ant: {previousVitals.talla})</span>}</label>
                                            <input type="number" step="0.01" name="talla" value={consultaForm.talla} onChange={handleConsultaChange} placeholder="Ej: 1.75" />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Presión Arterial {previousVitals?.presion && <span style={{ fontSize: '0.85em', color: '#64748b', marginLeft: '5px' }}>(Ant: {previousVitals.presion})</span>}</label>
                                            <input type="text" name="presion_arterial" value={consultaForm.presion_arterial} onChange={handleConsultaChange} placeholder="Ej: 120/80" />
                                        </div>
                                        <div className="form-group">
                                            <label>Temperatura (°C) {previousVitals?.temperatura && <span style={{ fontSize: '0.85em', color: '#64748b', marginLeft: '5px' }}>(Ant: {previousVitals.temperatura})</span>}</label>
                                            <input type="number" step="0.1" name="temperatura" value={consultaForm.temperatura} onChange={handleConsultaChange} placeholder="Ej: 36.5" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Grupo Sanguíneo</label>
                                        <select
                                            name="grupo_sanguineo"
                                            value={consultaForm.grupo_sanguineo}
                                            onChange={handleConsultaChange}
                                            disabled={!!existingBloodType}
                                            style={existingBloodType ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } : {}}
                                        >
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
                                    <button type="button" className="btn-primary full-width" onClick={() => setConsultaStep(2)}>Siguiente</button>
                                </div>
                            )}

                            {consultaStep === 2 && (
                                <div className="step-content">
                                    <h3>Antecedentes Médicos</h3>
                                    <div className="form-group">
                                        <label>Alergias</label>
                                        <textarea name="alergias" value={consultaForm.alergias} onChange={handleConsultaChange} rows="2" placeholder="Alergias a medicamentos, alimentos, etc." />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Enfermedades Crónicas</label>
                                            <textarea name="enfermedades_cronicas" value={consultaForm.enfermedades_cronicas} onChange={handleConsultaChange} rows="2" placeholder="Diabetes, Hipertensión, etc." />
                                        </div>
                                        <div className="form-group">
                                            <label>Cirugías Previas</label>
                                            <textarea name="cirugias_previas" value={consultaForm.cirugias_previas} onChange={handleConsultaChange} rows="2" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Medicamentos Habituales</label>
                                        <textarea name="medicamentos_actuales" value={consultaForm.medicamentos_actuales} onChange={handleConsultaChange} rows="2" placeholder="Medicamentos que toma actualmente" />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Antecedentes Familiares</label>
                                            <textarea name="antecedentes_familiares" value={consultaForm.antecedentes_familiares} onChange={handleConsultaChange} rows="2" />
                                        </div>
                                        <div className="form-group">
                                            <label>Antecedentes Personales / Hábitos</label>
                                            <textarea name="antecedentes_personales" value={consultaForm.antecedentes_personales} onChange={handleConsultaChange} rows="2" placeholder="Fumar, alcohol, actividad física..." />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Vacunas</label>
                                        <textarea name="vacunas" value={consultaForm.vacunas} onChange={handleConsultaChange} rows="1" />
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="btn-secondary" onClick={() => setConsultaStep(1)}>Atrás</button>
                                        <button type="button" className="btn-primary" onClick={() => setConsultaStep(3)}>Siguiente</button>
                                    </div>
                                </div>
                            )}

                            {consultaStep === 3 && (
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
                                        <label>Diagnósticos</label>
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                            <input
                                                type="text"
                                                placeholder="Ej. Hipertensión Arterial"
                                                value={nuevoDiagnostico}
                                                onChange={(e) => setNuevoDiagnostico(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAgregarDiagnostico()}
                                            />
                                            <button type="button" className="btn-secondary" onClick={handleAgregarDiagnostico}>Agregar</button>
                                        </div>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '15px' }}>
                                            {diagnosticosList.map((item, idx) => (
                                                <li key={idx} style={{ background: '#fff', padding: '8px', marginBottom: '4px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', border: '1px solid #eee' }}>
                                                    <span>• {item}</span>
                                                    <button type="button" onClick={() => handleEliminarDiagnostico(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="form-group">
                                        <label>Tratamiento / Indicaciones</label>
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                            <input
                                                type="text"
                                                placeholder="Ej. Reposo absoluto por 3 días"
                                                value={nuevoTratamiento}
                                                onChange={(e) => setNuevoTratamiento(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAgregarTratamiento()}
                                            />
                                            <button type="button" className="btn-secondary" onClick={handleAgregarTratamiento}>Agregar</button>
                                        </div>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '15px' }}>
                                            {tratamientosList.map((item, idx) => (
                                                <li key={idx} style={{ background: '#fff', padding: '8px', marginBottom: '4px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', border: '1px solid #eee' }}>
                                                    <span>• {item}</span>
                                                    <button type="button" onClick={() => handleEliminarTratamiento(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="form-group">
                                        <label>Observaciones</label>
                                        <textarea name="observaciones" value={consultaForm.observaciones} onChange={handleConsultaChange} rows="2" />
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="btn-secondary" onClick={() => setConsultaStep(2)}>Atrás</button>
                                        <button type="button" className="btn-primary" onClick={() => setConsultaStep(4)}>Siguiente</button>
                                    </div>
                                </div>
                            )}

                            {consultaStep === 4 && (
                                <div className="step-content">
                                    <h3>Tratamiento y Plan</h3>
                                    <div className="form-group">
                                        <label>Tratamiento</label>
                                        <textarea name="tratamiento" value={consultaForm.tratamiento} onChange={handleConsultaChange} rows="3" placeholder="Indicaciones generales" />
                                    </div>
                                    <div className="form-group">
                                        <label>Receta Médica (Estructurada)</label>

                                        <div className="med-builder" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                            <div className="form-row">
                                                <div className="form-group" style={{ flex: 2 }}>
                                                    <input type="text" placeholder="Medicamento (ej. Paracetamol)" value={nuevoMedicamento.nombre} onChange={e => setNuevoMedicamento({ ...nuevoMedicamento, nombre: e.target.value })} />
                                                </div>
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <input type="text" placeholder="Dosis (ej. 500mg)" value={nuevoMedicamento.dosis} onChange={e => setNuevoMedicamento({ ...nuevoMedicamento, dosis: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <input type="text" placeholder="Frecuencia (ej. cada 8h)" value={nuevoMedicamento.frecuencia} onChange={e => setNuevoMedicamento({ ...nuevoMedicamento, frecuencia: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <input type="text" placeholder="Duración (ej. 3 días)" value={nuevoMedicamento.duracion} onChange={e => setNuevoMedicamento({ ...nuevoMedicamento, duracion: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <input type="text" placeholder="Notas/Instrucciones (opcional)" value={nuevoMedicamento.notas} onChange={e => setNuevoMedicamento({ ...nuevoMedicamento, notas: e.target.value })} />
                                            </div>
                                            <button type="button" className="btn-secondary btn-sm" onClick={handleAgregarMedicamento}>+ Agregar Medicamento</button>
                                        </div>

                                        {medicamentosList.length > 0 && (
                                            <div className="med-list" style={{ marginTop: '10px' }}>
                                                {medicamentosList.map((med, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'white', borderBottom: '1px solid #eee', fontSize: '0.9em' }}>
                                                        <div>
                                                            <strong>{med.nombre} {med.dosis}</strong><br />
                                                            <span style={{ color: '#666' }}>{med.frecuencia} x {med.duracion}</span>
                                                            {med.notas && <span style={{ display: 'block', fontStyle: 'italic', color: '#888' }}>{med.notas}</span>}
                                                        </div>
                                                        <button type="button" onClick={() => handleEliminarMedicamento(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {/* Fallback hidden textarea for compatibility if needed, but we rely on json state */}
                                    </div>

                                    {/* Sección de Exámenes Auxiliares */}
                                    <div className="form-group" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '10px' }}>
                                        <div className="checkbox-wrapper" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                            <input
                                                type="checkbox"
                                                id="chkSolicitarExamen"
                                                checked={solicitarExamen}
                                                onChange={(e) => setSolicitarExamen(e.target.checked)}
                                                style={{ width: 'auto', marginRight: '10px' }}
                                            />
                                            <label htmlFor="chkSolicitarExamen" style={{ fontWeight: 'bold', cursor: 'pointer', margin: 0 }}>Solicitar Exámenes Auxiliares</label>
                                        </div>

                                        {solicitarExamen && (
                                            <div className="examen-solicitud-box" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                                                <div className="form-row" style={{ alignItems: 'flex-end' }}>
                                                    <div className="form-group" style={{ flex: 1 }}>
                                                        <label>Departamento</label>
                                                        <select value={examenDepto} onChange={handleDeptoChange}>
                                                            <option value="">Seleccione Departamento</option>
                                                            {departamentos.map(d => (
                                                                <option key={d.id_departamento} value={d.id_departamento}>{d.nombre}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="form-group" style={{ flex: 1 }}>
                                                        <label>Servicio / Examen</label>
                                                        <select value={examenServicio} onChange={(e) => setExamenServicio(e.target.value)} disabled={!examenDepto}>
                                                            <option value="">Seleccione Examen</option>
                                                            {serviciosExamen.map(s => (
                                                                <option key={s.id_servicio} value={s.id_servicio}>
                                                                    {s.nombre} - S/. {parseFloat(s.costo).toFixed(2)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="form-group" style={{ width: 'auto' }}>
                                                        <button
                                                            type="button"
                                                            className="btn-primary"
                                                            onClick={handleAgregarExamen}
                                                            style={{ padding: '10px 15px', height: '42px', marginTop: '0' }}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Lista de Exámenes Agregados */}
                                                {examenesAgregados.length > 0 && (
                                                    <div className="examenes-list" style={{ marginTop: '10px' }}>
                                                        <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '5px' }}>Exámenes Solicitados:</label>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                                                            {examenesAgregados.map((ex, idx) => (
                                                                <span key={idx} style={{
                                                                    background: '#e6fffa',
                                                                    color: '#008B85',
                                                                    padding: '4px 10px',
                                                                    borderRadius: '20px',
                                                                    fontSize: '13px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    border: '1px solid #b2f5ea'
                                                                }}>
                                                                    {ex.servicio} (S/. {parseFloat(ex.costo).toFixed(2)})
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleEliminarExamen(idx)}
                                                                        style={{
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            color: '#e53e3e',
                                                                            marginLeft: '6px',
                                                                            cursor: 'pointer',
                                                                            fontSize: '14px',
                                                                            padding: 0,
                                                                            display: 'flex',
                                                                            alignItems: 'center'
                                                                        }}
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 'bold', color: '#2d3748' }}>
                                                            Total Estimado: S/. {examenesAgregados.reduce((sum, ex) => sum + parseFloat(ex.costo || 0), 0).toFixed(2)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Próxima Cita (Opcional)</label>
                                        <input type="date" name="proxima_cita" value={consultaForm.proxima_cita} onChange={handleConsultaChange} min={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="btn-secondary" onClick={() => setConsultaStep(3)}>Atrás</button>
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
                                            <div className="historial-actions" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                                <button
                                                    className="btn-outline btn-sm"
                                                    onClick={() => generarPDF(atencion, 'informe')}
                                                    style={{ padding: '5px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid #cbd5e0', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                                                >
                                                    📄 Informe
                                                </button>
                                                {atencion.receta_medica && atencion.receta_medica.length > 2 && (
                                                    <button
                                                        className="btn-outline btn-sm"
                                                        onClick={() => generarPDF(atencion, 'receta')}
                                                        style={{ padding: '5px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid #cbd5e0', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                                                    >
                                                        💊 Receta
                                                    </button>
                                                )}
                                            </div>
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

                            {/* Sección de Archivos Adjuntos */}
                            <div className="perfil-section">
                                <h3>Archivos Adjuntos</h3>
                                <div style={{ marginBottom: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e0' }}>
                                    <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Adjuntar Nuevo Archivo</h4>
                                    <form onSubmit={handleUploadArchivo} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Archivo</label>
                                            <input id="fileInput" type="file" onChange={handleFileChange} required style={{ fontSize: '13px' }} />
                                        </div>
                                        <div style={{ width: '120px' }}>
                                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Tipo</label>
                                            <select value={fileType} onChange={(e) => setFileType(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e0' }}>
                                                <option value="Informe">Informe</option>
                                                <option value="Laboratorio">Laboratorio</option>
                                                <option value="Imagen">Imagen</option>
                                                <option value="Receta">Receta</option>
                                                <option value="Otro">Otro</option>
                                            </select>
                                        </div>
                                        <div style={{ flex: '2 1 200px' }}>
                                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Descripción</label>
                                            <input type="text" value={fileDesc} onChange={(e) => setFileDesc(e.target.value)} placeholder="Descripción opcional" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
                                        </div>
                                        <button type="submit" disabled={uploadingFile} className="btn-primary" style={{ padding: '8px 15px', height: '35px' }}>
                                            {uploadingFile ? 'Subiendo...' : 'Subir'}
                                        </button>
                                    </form>
                                </div>

                                <div className="archivos-list">
                                    {loadingArchivos ? (
                                        <p>Cargando archivos...</p>
                                    ) : archivosPaciente.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                                            {archivosPaciente.map(file => (
                                                <div key={file.id_archivo} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', background: 'white' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px', color: '#2b6cb0' }}>{file.tipo_documento}</div>
                                                    <a href={`http://localhost:5000${file.ruta_archivo}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '5px', fontSize: '13px', textDecoration: 'none', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        📄 {file.nombre_original}
                                                    </a>
                                                    {file.descripcion && <p style={{ fontSize: '12px', color: '#666', margin: '0 0 5px 0' }}>{file.descripcion}</p>}
                                                    <div style={{ fontSize: '11px', color: '#999' }}>
                                                        {new Date(file.fecha_subida).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted">No hay archivos adjuntos.</p>
                                    )}
                                </div>
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
