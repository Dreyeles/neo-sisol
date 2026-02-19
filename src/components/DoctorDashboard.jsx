// Solución de pantalla blanca - Forzando despliegue en Railway
import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import './Dashboard.css'; // Reusing existing dashboard styles
import API_BASE_URL from '../config';
import './DoctorDashboard.css'; // Doctor-specific styles
import LogoutIcon from './LogoutIcon';

const DoctorDashboard = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState('agenda');
    const [citas, setCitas] = useState([]);
    const [loadingCitas, setLoadingCitas] = useState(false);
    const [especialidadNombre, setEspecialidadNombre] = useState('Cargando...');
    const [pacientes, setPacientes] = useState([]);
    const [loadingPacientes, setLoadingPacientes] = useState(false);
    const [showAusentes, setShowAusentes] = useState(false);
    const [showConsultaModal, setShowConsultaModal] = useState(false);
    const [consultaActual, setConsultaActual] = useState(null);
    const [consultaStep, setConsultaStep] = useState(1); // 1: Datos/Triaje, 2: Consulta, 3: Tratamiento
    const [previousVitals, setPreviousVitals] = useState(null);
    const [existingBloodType, setExistingBloodType] = useState(null);
    const [showHistorialModal, setShowHistorialModal] = useState(false);
    const [showPerfilMedicoModal, setShowPerfilMedicoModal] = useState(false);
    const [historialData, setHistorialData] = useState([]);
    const [pacienteHistorial, setPacienteHistorial] = useState(null);
    const [perfilMedicoData, setPerfilMedicoData] = useState(null);

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

    const [medicamentosList, setMedicamentosList] = useState([]);
    const [nuevoMedicamento, setNuevoMedicamento] = useState({ nombre: '', dosis: '', frecuencia: '', duracion: '', notas: '' });
    const [diagnosticosList, setDiagnosticosList] = useState([]);
    const [nuevoDiagnostico, setNuevoDiagnostico] = useState('');
    const [tratamientosList, setTratamientosList] = useState([]);
    const [nuevoTratamiento, setNuevoTratamiento] = useState('');

    const [alergiasList, setAlergiasList] = useState([]);
    const [nuevaAlergia, setNuevaAlergia] = useState('');
    const [enfermedadesCronicasList, setEnfermedadesCronicasList] = useState([]);
    const [nuevaEnfermedad, setNuevaEnfermedad] = useState('');
    const [cirugiasPreviasList, setCirugiasPreviasList] = useState([]);
    const [nuevaCirugia, setNuevaCirugia] = useState('');
    const [medicamentosActualesList, setMedicamentosActualesList] = useState([]);
    const [nuevoMedHabitual, setNuevoMedHabitual] = useState('');
    const [antecedentesFamiliaresList, setAntecedentesFamiliaresList] = useState([]);
    const [nuevoAntFamiliar, setNuevoAntFamiliar] = useState('');
    const [antecedentesPersonalesList, setAntecedentesPersonalesList] = useState([]);
    const [nuevoAntPersonal, setNuevoAntPersonal] = useState('');
    const [vacunasList, setVacunasList] = useState([]);
    const [nuevaVacuna, setNuevaVacuna] = useState('');
    const [nuevaDosisVacuna, setNuevaDosisVacuna] = useState('');
    const [sintomasList, setSintomasList] = useState([]);
    const [nuevoSintoma, setNuevoSintoma] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const [archivosPaciente, setArchivosPaciente] = useState([]);
    const [loadingArchivos, setLoadingArchivos] = useState(false);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [fileType, setFileType] = useState('Informe');
    const [fileDesc, setFileDesc] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);

    const [solicitarExamen, setSolicitarExamen] = useState(false);
    const [departamentos, setDepartamentos] = useState([]);
    const [serviciosExamen, setServiciosExamen] = useState([]);
    const [examenDepto, setExamenDepto] = useState('');
    const [examenServicio, setExamenServicio] = useState('');
    const [examenesAgregados, setExamenesAgregados] = useState([]);

    // Cargar citas del médico
    const fetchCitas = async () => {
        if (!user?.id_medico) return;
        setLoadingCitas(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/citas/medico/${user.id_medico}`);
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

    // Cargar pacientes del médico
    const fetchPacientes = async () => {
        if (!user?.id_medico) return;
        setLoadingPacientes(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/medicos/${user.id_medico}/pacientes`);
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
        const fetchEspecialidad = async () => {
            if (!user?.id_especialidad) return;
            try {
                const response = await fetch(`${API_BASE_URL}/api/especialidades`);
                const data = await response.json();
                if (data.status === 'OK') {
                    const esp = data.data.find(e => e.id_especialidad === user.id_especialidad);
                    if (esp) setEspecialidadNombre(esp.nombre);
                }
            } catch (error) {
                console.error('Error al cargar especialidad:', error);
                setEspecialidadNombre('No disponible');
            }
        };

        if (activeSection === 'agenda') {
            fetchCitas();
        } else if (activeSection === 'pacientes') {
            fetchPacientes();
        } else if (activeSection === 'perfil') {
            fetchEspecialidad();
        }
    }, [user, activeSection]);

    const agendaDelDia = citas.filter(c =>
        showAusentes
            ? c.estado === 'no_asistio'
            : (c.estado === 'programada' || c.estado === 'confirmada' || c.estado === 'pagado')
    );

    const handleConsultaChange = (e) => {
        const { name, value } = e.target;
        setConsultaForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Prevenir scroll del body cuando cualquier modal está abierto
    useEffect(() => {
        if (showConsultaModal || showHistorialModal || showPerfilMedicoModal) {
            document.documentElement.classList.add('no-scroll');
            document.body.classList.add('no-scroll');
        } else {
            document.documentElement.classList.remove('no-scroll');
            document.body.classList.remove('no-scroll');
        }
        return () => {
            document.documentElement.classList.remove('no-scroll');
            document.body.classList.remove('no-scroll');
        };
    }, [showConsultaModal, showHistorialModal, showPerfilMedicoModal]);

    // Handlers genéricos para las nuevas listas
    // Handlers genéricos para las nuevas listas
    const handleAddToList = (setter, inputSetter, value, list) => {
        if (value.trim()) {
            setter([...list, { text: value.trim(), locked: false }]);
            inputSetter('');
        }
    };

    const handleAgregarVacuna = () => {
        if (nuevaVacuna.trim()) {
            const entry = nuevaDosisVacuna.trim()
                ? `${nuevaVacuna.trim()} - ${nuevaDosisVacuna.trim()}`
                : nuevaVacuna.trim();
            setVacunasList([...vacunasList, { text: entry, locked: false }]);
            setNuevaVacuna('');
            setNuevaDosisVacuna('');
        }
    };

    const handleRemoveFromList = (setter, list, idx) => {
        const newList = [...list];
        newList.splice(idx, 1);
        setter(newList);
    };

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
        setMedicamentosList([]);
        setDiagnosticosList([]);
        setTratamientosList([]);

        // Reset nuevas listas
        setAlergiasList([]);
        setEnfermedadesCronicasList([]);
        setCirugiasPreviasList([]);
        setMedicamentosActualesList([]);
        setAntecedentesFamiliaresList([]);
        setAntecedentesPersonalesList([]);
        setVacunasList([]);
        setSintomasList([]);

        setSolicitarExamen(false);
        setConsultaStep(1);

        // Fetch patient data for context
        try {
            const profileResp = await fetch(`${API_BASE_URL}/api/pacientes/perfil-medico/${cita.id_paciente}`);
            const profileData = await profileResp.json();

            const historyResp = await fetch(`${API_BASE_URL}/api/atencion/historial/${cita.id_paciente}`);
            const historyData = await historyResp.json();

            let bloodType = '';
            let prevVitals = null;
            let historial = {};
            let pData = {};

            if (profileData.status === 'OK') {
                pData = profileData.data;
                bloodType = pData.grupo_sanguineo || '';
                setExistingBloodType(bloodType);
                historial = pData.historial_medico || {};

                // Intentar parsear listas de antecedentes si vienen como JSON
                const parseList = (str) => {
                    let list = [];
                    if (!str) return [];
                    try {
                        const parsed = JSON.parse(str);
                        list = Array.isArray(parsed) ? parsed : [str];
                    } catch (e) {
                        list = [str];
                    }
                    // Transformar a objetos con propiedad locked
                    return list.map(item => ({ text: item, locked: true }));
                };

                setAlergiasList(parseList(pData.alergias));
                setEnfermedadesCronicasList(parseList(historial.enfermedades_cronicas));
                setCirugiasPreviasList(parseList(historial.cirugias_previas));
                setMedicamentosActualesList(parseList(historial.medicamentos_actuales));
                setAntecedentesFamiliaresList(parseList(historial.antecedentes_familiares));
                setAntecedentesPersonalesList(parseList(historial.antecedentes_personales));
                setVacunasList(parseList(historial.vacunas));
            }

            if (historyData.status === 'OK' && historyData.data.length > 0) {
                const latest = historyData.data[0];
                let signs = latest.signos_vitales;
                if (typeof signs === 'string') {
                    try { signs = JSON.parse(signs); } catch (e) { }
                }
                prevVitals = signs;
            }
            setPreviousVitals(prevVitals);

            setConsultaForm(prev => ({
                ...prev,
                motivo_consulta: cita.motivo_consulta || '',
                grupo_sanguineo: bloodType,
                peso: '', talla: '', presion_arterial: '', temperatura: '',
                observaciones: '',
                proxima_cita: ''
            }));

            setShowConsultaModal(true);

        } catch (error) {
            console.error("Error fetching patient details for consultation:", error);
            alert("Error al cargar datos del paciente. Intente nuevamente.");
        }
    };



    const handleVerHistorialPaciente = async (paciente) => {
        // Soporte para cuando se pasa solo el ID o el objeto completo
        const id_paciente = paciente.id_paciente || paciente;
        const pacienteObj = typeof paciente === 'object' ? paciente : { id_paciente: id_paciente, nombres: 'Paciente', apellidos: '' };

        setPacienteHistorial(pacienteObj);

        try {
            const response = await fetch(`${API_BASE_URL}/api/atencion/historial/${id_paciente}`);
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

            // --- NUEVAS SECCIONES ESTRUCTURADAS ---
            doc.setFont("helvetica", "bold"); doc.setFontSize(11);
            doc.text("ANTECEDENTES PATOLÓGICOS:", 20, yPos);
            yPos += 7;
            doc.setFontSize(10);

            yPos = renderStructuredSection("• Alergias", atencion.alergias, yPos);
            yPos = renderStructuredSection("• Enfermedades Crónicas", atencion.enfermedades_cronicas, yPos);
            yPos = renderStructuredSection("• Cirugías Previas", atencion.cirugias_previas, yPos);
            yPos = renderStructuredSection("• Medicamentos Habituales", atencion.medicamentos_actuales, yPos);
            yPos = renderStructuredSection("• Antecedentes Familiares", atencion.antecedentes_familiares, yPos);
            yPos = renderStructuredSection("• Antecedentes Personales", atencion.antecedentes_personales, yPos);
            yPos = renderStructuredSection("• Vacunas", atencion.vacunas, yPos);

            doc.line(20, yPos, 190, yPos);
            yPos += 10;

            yPos = renderStructuredSection("SÍNTOMAS / ANAMNESIS", atencion.sintomas, yPos);
            yPos = renderStructuredSection("DIAGNÓSTICO", atencion.diagnostico, yPos);
            yPos = renderStructuredSection("TRATAMIENTO / INDICACIONES", atencion.tratamiento, yPos);

            // Observaciones sigue siendo texto plano mayormente, pero usamos el helper por consistencia
            if (atencion.observaciones) {
                yPos = renderStructuredSection("OBSERVACIONES", atencion.observaciones, yPos);
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


    const handleSearchPacientes = async () => {
        setLoadingSearch(true);
        try {
            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('q', searchTerm);
            if (searchDate) queryParams.append('fecha', searchDate);

            const response = await fetch(`${API_BASE_URL}/api/pacientes/buscar?${queryParams}`);
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


    // --- ESTADOS Y FUNCIONES PARA ARCHIVOS MÉDICOS ---

    const fetchArchivosPaciente = async (id_paciente) => {
        setLoadingArchivos(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/archivos/paciente/${id_paciente}`);
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
            const response = await fetch(`${API_BASE_URL}/api/archivos/upload`, {
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
            const response = await fetch(`${API_BASE_URL}/api/pacientes/perfil-medico/${id_paciente}`);
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


    // Cargar departamentos al iniciar
    useEffect(() => {
        const fetchDepartamentos = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/servicios/departamentos`);
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

    const setProximaCitaByOffset = (days) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        const formattedDate = date.toISOString().split('T')[0];
        setConsultaForm(prev => ({
            ...prev,
            proxima_cita: formattedDate
        }));
    };

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
            const response = await fetch(`${API_BASE_URL}/api/servicios/por-departamento/${id_depto}`);
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
            const response = await fetch(`${API_BASE_URL}/api/atencion/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_cita: consultaActual.id_cita,
                    id_paciente: consultaActual.id_paciente || 1,
                    id_medico: user.id_medico,
                    peso: consultaForm.peso,
                    talla: consultaForm.talla,
                    presion_arterial: consultaForm.presion_arterial,
                    temperatura: consultaForm.temperatura,
                    grupo_sanguineo: consultaForm.grupo_sanguineo,

                    // Nuevos campos estructurados como JSON
                    alergias: JSON.stringify(alergiasList.map(i => i.text)),
                    enfermedades_cronicas: JSON.stringify(enfermedadesCronicasList.map(i => i.text)),
                    cirugias_previas: JSON.stringify(cirugiasPreviasList.map(i => i.text)),
                    medicamentos_actuales: JSON.stringify(medicamentosActualesList.map(i => i.text)),
                    antecedentes_familiares: JSON.stringify(antecedentesFamiliaresList.map(i => i.text)),
                    antecedentes_personales: JSON.stringify(antecedentesPersonalesList.map(i => i.text)),
                    vacunas: JSON.stringify(vacunasList.map(i => i.text)),

                    motivo_consulta: consultaForm.motivo_consulta,
                    sintomas: JSON.stringify(sintomasList.map(i => i.text)),
                    observaciones: consultaForm.observaciones,
                    proxima_cita: consultaForm.proxima_cita,

                    diagnostico: JSON.stringify(diagnosticosList),
                    tratamiento: JSON.stringify(tratamientosList),
                    receta_medica: JSON.stringify(medicamentosList),
                    examenes_solicitados: JSON.stringify(examenesAgregados)
                })
            });

            const data = await response.json();

            if (data.status === 'OK') {
                alert('Atención médica registrada exitosamente');
                setShowConsultaModal(false);
                fetchCitas();
            } else {
                alert('Error al registrar atención: ' + data.message);
            }
        } catch (error) {
            console.error('Error al registrar atención:', error);
            alert('Error de conexión al registrar atención');
        }
    };

    const handleMarcarNoAsistio = async (id_cita) => {
        if (!window.confirm('¿Está seguro de marcar esta cita como "No Asistió"? Esto liberará el cupo para otros pacientes.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/citas/${id_cita}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'no_asistio' })
            });

            const data = await response.json();

            if (data.status === 'OK') {
                alert('Cita marcada como "No Asistió" correctamente.');
                fetchCitas(); // Recargar la lista
            } else {
                alert('Error al actualizar estado: ' + data.message);
            }
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            alert('Error de conexión');
        }
    };

    const handleRecuperarCita = async (id_cita) => {
        if (!window.confirm('¿Desea recuperar esta cita? Esto la volverá a activar en su agenda (SOBRE-CUPO).')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/citas/${id_cita}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'programada' })
            });

            const data = await response.json();

            if (data.status === 'OK') {
                alert('Cita recuperada exitosamente.');
                fetchCitas();
                setShowAusentes(false); // Volver a la vista principal
            } else {
                alert('Error al recuperar cita: ' + data.message);
            }
        } catch (error) {
            console.error('Error al recuperar cita:', error);
            alert('Error de conexión');
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
                        <div className="nav-icon-wrapper">
                            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {agendaDelDia.length > 0 && <span className="nav-badge"></span>}
                        </div>
                        Mi Agenda
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'pacientes' ? 'active' : ''}`}
                        onClick={() => setActiveSection('pacientes')}
                    >
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Mis Pacientes
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'historial' ? 'active' : ''}`}
                        onClick={() => setActiveSection('historial')}
                    >
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                        Historial Médico
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'perfil' ? 'active' : ''}`}
                        onClick={() => setActiveSection('perfil')}
                    >
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Mi Perfil
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
                        <h1>Hola, Dr. {user?.nombres || 'Médico'}</h1>
                        <p>{agendaDelDia.length > 0
                            ? `Tienes ${agendaDelDia.length} ${agendaDelDia.length === 1 ? 'cita programada' : 'citas programadas'} para hoy.`
                            : 'No tienes citas programadas para hoy.'}
                        </p>
                    </div>
                </header>

                <main className="dashboard-main">
                    {activeSection === 'agenda' && (
                        <div className="section-content">
                            <div className="agenda-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2>{showAusentes ? 'Pacientes Ausentes' : 'Agenda del Día'}</h2>
                                <button
                                    className="btn-secondary"
                                    onClick={() => setShowAusentes(!showAusentes)}
                                >
                                    {showAusentes ? 'Ver Agenda Activa' : 'Ver Ausentes'}
                                </button>
                            </div>
                            <div className="citas-list">
                                {loadingCitas ? (
                                    <p>Cargando agenda...</p>
                                ) : agendaDelDia.length > 0 ? (
                                    agendaDelDia.map(cita => (
                                        <div className="cita-card" key={cita.id_cita}>
                                            <div className="cita-info">
                                                <h3>Paciente: {cita.paciente_nombre} {cita.paciente_apellido}</h3>
                                                <p><strong>{cita.servicio_nombre || 'Consulta Médica'}:</strong> {cita.motivo_consulta}</p>
                                                <p className="cita-fecha">
                                                    <svg className="icon-tiny" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                        <line x1="16" y1="2" x2="16" y2="6" />
                                                        <line x1="8" y1="2" x2="8" y2="6" />
                                                        <line x1="3" y1="10" x2="21" y2="10" />
                                                    </svg>
                                                    {cita.fechaFormatted} -
                                                    <svg className="icon-tiny" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '10px' }}>
                                                        <circle cx="12" cy="12" r="10" />
                                                        <polyline points="12 6 12 12 16 14" />
                                                    </svg>
                                                    {cita.hora_cita}
                                                </p>
                                                <span className={`historial - status ${cita.estado} `}>{cita.estado}</span>
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
                                                    onClick={() => handleVerPerfilMedico(cita.id_paciente)}
                                                >
                                                    Ver Historia
                                                </button>
                                                {!showAusentes ? (
                                                    <button
                                                        className="btn-danger-outline"
                                                        style={{ marginLeft: '10px' }}
                                                        onClick={() => handleMarcarNoAsistio(cita.id_cita)}
                                                        title="Marcar como No Asistió"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                            <circle cx="8.5" cy="7" r="4" />
                                                            <line x1="18" y1="8" x2="23" y2="13" />
                                                            <line x1="23" y1="8" x2="18" y2="13" />
                                                        </svg>
                                                        No Asistió
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn-success"
                                                        style={{ marginLeft: '10px' }}
                                                        onClick={() => handleRecuperarCita(cita.id_cita)}
                                                        title="Recuperar Cita (Overbooking)"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                            <circle cx="8.5" cy="7" r="4" />
                                                            <polyline points="17 11 19 13 23 9" />
                                                        </svg>
                                                        Recuperar
                                                    </button>
                                                )}
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
                                            <div className="paciente-avatar">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
                                            </div>
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
                                    <button className="btn-primary" onClick={handleSearchPacientes} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="11" cy="11" r="8" />
                                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
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
                        <div className="section-content profile-redesign">
                            <div className="profile-banner">
                                <div className="banner-content">
                                    <div className="profile-avatar-wrapper">
                                        <div className="avatar-placeholder">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="banner-info">
                                        <h2>Dr. {user?.nombres} {user?.apellidos}</h2>
                                        <div className="banner-badges">
                                            <span className="badge badge-specialty">{especialidadNombre}</span>
                                            <span className="badge badge-cmp">{user?.numero_colegiatura}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="kpi-summary">
                                <div className="kpi-card">
                                    <div className="kpi-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                    </div>
                                    <div className="kpi-data">
                                        <span className="kpi-value">{citas.length}</span>
                                        <span className="kpi-label">Citas de Hoy</span>
                                    </div>
                                </div>
                                <div className="kpi-card">
                                    <div className="kpi-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                    </div>
                                    <div className="kpi-data">
                                        <span className="kpi-value">{pacientes.length}</span>
                                        <span className="kpi-label">Pacientes Totales</span>
                                    </div>
                                </div>
                            </div>

                            <div className="perfil-info-grid">
                                <div className="info-card">
                                    <div className="card-header">
                                        <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        <span>Horario y Modalidad</span>
                                    </div>
                                    <div className="card-body">
                                        <div className="data-item">
                                            <label>Turno de Atención</label>
                                            <p>{user?.horario_atencion || 'No asignado'}</p>
                                        </div>
                                        <div className="data-item">
                                            <label>Costo de Consulta</label>
                                            <p className="price-text">S/. {user?.costo_consulta ? parseFloat(user.costo_consulta).toFixed(2) : '0.00'}</p>
                                        </div>
                                        <div className="data-item">
                                            <label>Estado</label>
                                            <span className={`status - tag ${user?.estado} `}>
                                                {user?.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="card-header">
                                        <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                        <span>Contacto Directo</span>
                                    </div>
                                    <div className="card-body">
                                        <div className="data-item">
                                            <label>Correo Institucional</label>
                                            <p>{user?.email}</p>
                                        </div>
                                        <div className="data-item">
                                            <label>Teléfono Fijo</label>
                                            <p>{user?.telefono || 'No registrado'}</p>
                                        </div>
                                        <div className="data-item">
                                            <label>Celular</label>
                                            <p>{user?.celular || 'No registrado'}</p>
                                        </div>
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
                            <div className={`step ${consultaStep >= 1 ? 'active' : ''} `}>1. Triaje</div>
                            <div className="line"></div>
                            <div className={`step ${consultaStep >= 2 ? 'active' : ''} `}>2. Antecedentes</div>
                            <div className="line"></div>
                            <div className={`step ${consultaStep >= 3 ? 'active' : ''} `}>3. Diagnóstico</div>
                            <div className="line"></div>
                            <div className={`step ${consultaStep >= 4 ? 'active' : ''} `}>4. Tratamiento</div>
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

                                    <div className="clinical-list-section">
                                        <div className="form-group">
                                            <label>Alergias</label>
                                            <div className="list-input-group">
                                                <input
                                                    type="text"
                                                    placeholder="Alergia a medicamentos, alimentos, etc."
                                                    value={nuevaAlergia}
                                                    onChange={(e) => setNuevaAlergia(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToList(setAlergiasList, setNuevaAlergia, nuevaAlergia, alergiasList))}
                                                />
                                                <button type="button" className="btn-secondary" onClick={() => handleAddToList(setAlergiasList, setNuevaAlergia, nuevaAlergia, alergiasList)}>Añadir</button>
                                            </div>
                                            <ul className="clinical-tags">
                                                {alergiasList.map((item, idx) => (
                                                    <li key={idx} className="clinical-tag red">
                                                        <span>{item.text}</span>
                                                        {!item.locked && <button type="button" onClick={() => handleRemoveFromList(setAlergiasList, alergiasList, idx)}>×</button>}
                                                        {item.locked && <span style={{ marginLeft: '5px', fontSize: '10px' }} title="Dato histórico (no editable)">🔒</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Enfermedades Crónicas</label>
                                                <div className="list-input-group">
                                                    <input
                                                        type="text"
                                                        placeholder="Diabetes, Hipertensión, etc."
                                                        value={nuevaEnfermedad}
                                                        onChange={(e) => setNuevaEnfermedad(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToList(setEnfermedadesCronicasList, setNuevaEnfermedad, nuevaEnfermedad, enfermedadesCronicasList))}
                                                    />
                                                    <button type="button" className="btn-secondary" onClick={() => handleAddToList(setEnfermedadesCronicasList, setNuevaEnfermedad, nuevaEnfermedad, enfermedadesCronicasList)}>Añadir</button>
                                                </div>
                                                <ul className="clinical-tags">
                                                    {enfermedadesCronicasList.map((item, idx) => (
                                                        <li key={idx} className="clinical-tag blue">
                                                            <span>{item.text}</span>
                                                            {!item.locked && <button type="button" onClick={() => handleRemoveFromList(setEnfermedadesCronicasList, enfermedadesCronicasList, idx)}>×</button>}
                                                            {item.locked && <span style={{ marginLeft: '5px', fontSize: '10px' }} title="Dato histórico (no editable)">🔒</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="form-group">
                                                <label>Cirugías Previas</label>
                                                <div className="list-input-group">
                                                    <input
                                                        type="text"
                                                        value={nuevaCirugia}
                                                        onChange={(e) => setNuevaCirugia(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToList(setCirugiasPreviasList, setNuevaCirugia, nuevaCirugia, cirugiasPreviasList))}
                                                    />
                                                    <button type="button" className="btn-secondary" onClick={() => handleAddToList(setCirugiasPreviasList, setNuevaCirugia, nuevaCirugia, cirugiasPreviasList)}>Añadir</button>
                                                </div>
                                                <ul className="clinical-tags">
                                                    {cirugiasPreviasList.map((item, idx) => (
                                                        <li key={idx} className="clinical-tag gray">
                                                            <span>{item.text}</span>
                                                            {!item.locked && <button type="button" onClick={() => handleRemoveFromList(setCirugiasPreviasList, cirugiasPreviasList, idx)}>×</button>}
                                                            {item.locked && <span style={{ marginLeft: '5px', fontSize: '10px' }} title="Dato histórico (no editable)">🔒</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Medicamentos Habituales</label>
                                            <div className="list-input-group">
                                                <input
                                                    type="text"
                                                    placeholder="Medicamentos que toma actualmente"
                                                    value={nuevoMedHabitual}
                                                    onChange={(e) => setNuevoMedHabitual(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToList(setMedicamentosActualesList, setNuevoMedHabitual, nuevoMedHabitual, medicamentosActualesList))}
                                                />
                                                <button type="button" className="btn-secondary" onClick={() => handleAddToList(setMedicamentosActualesList, setNuevoMedHabitual, nuevoMedHabitual, medicamentosActualesList)}>Añadir</button>
                                            </div>
                                            <ul className="clinical-tags">
                                                {medicamentosActualesList.map((item, idx) => (
                                                    <li key={idx} className="clinical-tag green">
                                                        <span>{item.text}</span>
                                                        {!item.locked && <button type="button" onClick={() => handleRemoveFromList(setMedicamentosActualesList, medicamentosActualesList, idx)}>×</button>}
                                                        {item.locked && <span style={{ marginLeft: '5px', fontSize: '10px' }} title="Dato histórico (no editable)">🔒</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Antecedentes Familiares</label>
                                                <div className="list-input-group">
                                                    <input
                                                        type="text"
                                                        value={nuevoAntFamiliar}
                                                        onChange={(e) => setNuevoAntFamiliar(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToList(setAntecedentesFamiliaresList, setNuevoAntFamiliar, nuevoAntFamiliar, antecedentesFamiliaresList))}
                                                    />
                                                    <button type="button" className="btn-secondary" onClick={() => handleAddToList(setAntecedentesFamiliaresList, setNuevoAntFamiliar, nuevoAntFamiliar, antecedentesFamiliaresList)}>Añadir</button>
                                                </div>
                                                <ul className="clinical-tags">
                                                    {antecedentesFamiliaresList.map((item, idx) => (
                                                        <li key={idx} className="clinical-tag purple">
                                                            <span>{item.text}</span>
                                                            {!item.locked && <button type="button" onClick={() => handleRemoveFromList(setAntecedentesFamiliaresList, antecedentesFamiliaresList, idx)}>×</button>}
                                                            {item.locked && <span style={{ marginLeft: '5px', fontSize: '10px' }} title="Dato histórico (no editable)">🔒</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="form-group">
                                                <label>Antecedentes Personales / Hábitos</label>
                                                <div className="list-input-group">
                                                    <input
                                                        type="text"
                                                        placeholder="Fumar, alcohol, actividad física..."
                                                        value={nuevoAntPersonal}
                                                        onChange={(e) => setNuevoAntPersonal(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToList(setAntecedentesPersonalesList, setNuevoAntPersonal, nuevoAntPersonal, antecedentesPersonalesList))}
                                                    />
                                                    <button type="button" className="btn-secondary" onClick={() => handleAddToList(setAntecedentesPersonalesList, setNuevoAntPersonal, nuevoAntPersonal, antecedentesPersonalesList)}>Añadir</button>
                                                </div>
                                                <ul className="clinical-tags">
                                                    {antecedentesPersonalesList.map((item, idx) => (
                                                        <li key={idx} className="clinical-tag orange">
                                                            <span>{item.text}</span>
                                                            {!item.locked && <button type="button" onClick={() => handleRemoveFromList(setAntecedentesPersonalesList, antecedentesPersonalesList, idx)}>×</button>}
                                                            {item.locked && <span style={{ marginLeft: '5px', fontSize: '10px' }} title="Dato histórico (no editable)">🔒</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Vacunas</label>
                                            <div className="list-input-group">
                                                <input
                                                    type="text"
                                                    style={{ flex: 2 }}
                                                    placeholder="Nombre de la vacuna"
                                                    value={nuevaVacuna}
                                                    onChange={(e) => setNuevaVacuna(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAgregarVacuna())}
                                                />
                                                <input
                                                    type="text"
                                                    style={{ flex: 1 }}
                                                    placeholder="Dosis"
                                                    value={nuevaDosisVacuna}
                                                    onChange={(e) => setNuevaDosisVacuna(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAgregarVacuna())}
                                                />
                                                <button type="button" className="btn-secondary" onClick={handleAgregarVacuna}>Añadir</button>
                                            </div>
                                            <ul className="clinical-tags">
                                                {vacunasList.map((item, idx) => (
                                                    <li key={idx} className="clinical-tag teal">
                                                        <span>{item.text}</span>
                                                        {!item.locked && <button type="button" onClick={() => handleRemoveFromList(setVacunasList, vacunasList, idx)}>×</button>}
                                                        {item.locked && <span style={{ marginLeft: '5px', fontSize: '10px' }} title="Dato histórico (no editable)">🔒</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
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
                                        <label>Motivo de Consulta (Relato del Paciente)</label>
                                        <textarea
                                            name="motivo_consulta"
                                            value={consultaForm.motivo_consulta}
                                            readOnly
                                            rows="2"
                                            style={{ backgroundColor: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Síntomas / Anamnesis</label>
                                        <div className="list-input-group">
                                            <input
                                                type="text"
                                                placeholder="Detalle síntomas y relato del paciente"
                                                value={nuevoSintoma}
                                                onChange={(e) => setNuevoSintoma(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToList(setSintomasList, setNuevoSintoma, nuevoSintoma, sintomasList))}
                                            />
                                            <button type="button" className="btn-secondary" onClick={() => handleAddToList(setSintomasList, setNuevoSintoma, nuevoSintoma, sintomasList)}>Añadir</button>
                                        </div>
                                        <ul className="clinical-tags">
                                            {sintomasList.map((item, idx) => (
                                                <li key={idx} className="clinical-tag blue">
                                                    <span>{item.text}</span>
                                                    <button type="button" onClick={() => handleRemoveFromList(setSintomasList, sintomasList, idx)}>×</button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="form-group">
                                        <label>Diagnósticos</label>
                                        <div className="list-input-group">
                                            <input
                                                type="text"
                                                placeholder="Ej. Hipertensión Arterial"
                                                value={nuevoDiagnostico}
                                                onChange={(e) => setNuevoDiagnostico(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAgregarDiagnostico())}
                                            />
                                            <button type="button" className="btn-secondary" onClick={handleAgregarDiagnostico}>Añadir</button>
                                        </div>
                                        <ul className="clinical-tags">
                                            {diagnosticosList.map((item, idx) => (
                                                <li key={idx} className="clinical-tag diagnostico">
                                                    <span>• {item}</span>
                                                    <button type="button" onClick={() => handleEliminarDiagnostico(idx)}>×</button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="form-group">
                                        <label>Observaciones Adicionales</label>
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
                                        <label>Tratamiento / Indicaciones Generales</label>
                                        <div className="list-input-group">
                                            <input
                                                type="text"
                                                placeholder="Ej. Reposo absoluto por 3 días"
                                                value={nuevoTratamiento}
                                                onChange={(e) => setNuevoTratamiento(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAgregarTratamiento())}
                                            />
                                            <button type="button" className="btn-secondary" onClick={handleAgregarTratamiento}>Añadir</button>
                                        </div>
                                        <ul className="clinical-tags">
                                            {tratamientosList.map((item, idx) => (
                                                <li key={idx} className="clinical-tag green">
                                                    <span>• {item}</span>
                                                    <button type="button" onClick={() => handleEliminarTratamiento(idx)}>×</button>
                                                </li>
                                            ))}
                                        </ul>
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
                                    <div className="exam-request-section">
                                        <div className="checkbox-wrapper-modern">
                                            <input
                                                type="checkbox"
                                                id="chkSolicitarExamen"
                                                checked={solicitarExamen}
                                                onChange={(e) => setSolicitarExamen(e.target.checked)}
                                            />
                                            <label htmlFor="chkSolicitarExamen">Solicitar Exámenes Auxiliares</label>
                                        </div>

                                        {solicitarExamen && (
                                            <div className="examen-solicitud-box">
                                                <div className="examen-input-grid">
                                                    <div className="form-group">
                                                        <label>Departamento</label>
                                                        <select value={examenDepto} onChange={handleDeptoChange}>
                                                            <option value="">Seleccione Departamento</option>
                                                            {departamentos.map(d => (
                                                                <option key={d.id_departamento} value={d.id_departamento}>{d.nombre}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="form-group">
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
                                                    <div className="add-examen-btn-wrapper">
                                                        <button
                                                            type="button"
                                                            className="btn-primary btn-add-examen"
                                                            onClick={handleAgregarExamen}
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
                                        <div className="quick-date-presets">
                                            <button type="button" className="btn-preset" onClick={() => setProximaCitaByOffset(7)}>+1 Sem</button>
                                            <button type="button" className="btn-preset" onClick={() => setProximaCitaByOffset(15)}>+15 Días</button>
                                            <button type="button" className="btn-preset" onClick={() => setProximaCitaByOffset(30)}>+1 Mes</button>
                                        </div>
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
                                <div className="upload-file-box">
                                    <h4>Adjuntar Nuevo Archivo</h4>
                                    <form onSubmit={handleUploadArchivo} className="upload-form">
                                        <div className="upload-group-file">
                                            <label>Archivo</label>
                                            <input id="fileInput" type="file" onChange={handleFileChange} required />
                                        </div>
                                        <div className="upload-group-type">
                                            <label>Tipo</label>
                                            <select value={fileType} onChange={(e) => setFileType(e.target.value)}>
                                                <option value="Informe">Informe</option>
                                                <option value="Laboratorio">Laboratorio</option>
                                                <option value="Imagen">Imagen</option>
                                                <option value="Receta">Receta</option>
                                                <option value="Otro">Otro</option>
                                            </select>
                                        </div>
                                        <div className="upload-group-desc">
                                            <label>Descripción</label>
                                            <input type="text" value={fileDesc} onChange={(e) => setFileDesc(e.target.value)} placeholder="Descripción opcional" />
                                        </div>
                                        <button type="submit" disabled={uploadingFile} className="btn-primary btn-upload">
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
                                                    <a href={`${API_BASE_URL}${file.ruta_archivo}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '5px', fontSize: '13px', textDecoration: 'none', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        📄 {file.nombre_original}
                                                    </a >
                                                    {file.descripcion && <p style={{ fontSize: '12px', color: '#666', margin: '0 0 5px 0' }}>{file.descripcion}</p>}
                                                    < div style={{ fontSize: '11px', color: '#999' }}>
                                                        {new Date(file.fecha_subida).toLocaleDateString()}
                                                    </div >
                                                </div >
                                            ))}
                                        </div >
                                    ) : (
                                        <p className="text-muted">No hay archivos adjuntos.</p>
                                    )}
                                </div >
                            </div >

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
                        </div >
                    </div >
                </div >
            )}
        </div >
    );
};

export default DoctorDashboard;
