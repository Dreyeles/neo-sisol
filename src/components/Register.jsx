import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import './Register.css';

const Register = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'El nombre es requerido';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'El apellido es requerido';
    }

    if (!formData.dni) {
      newErrors.dni = 'El DNI es requerido';
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe tener exactamente 8 dígitos';
    }

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else {
      const password = formData.password;
      const requirements = [];
      if (password.length < 8) requirements.push('mínimo 8 caracteres');
      if (!/[A-Z]/.test(password)) requirements.push('una mayúscula');
      if (!/[a-z]/.test(password)) requirements.push('una minúscula');
      if (!/\d/.test(password)) requirements.push('un número');
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) requirements.push('un carácter especial');

      if (requirements.length > 0) {
        newErrors.password = `La contraseña requiere: ${requirements.join(', ')}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrarse');
      }

      console.log('Registro exitoso:', data);
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');

      onClose();

      setFormData({
        nombres: '',
        apellidos: '',
        dni: '',
        email: '',
        password: ''
      });

      if (onSwitchToLogin) {
        setTimeout(() => onSwitchToLogin(), 100);
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      alert(error.message || 'Error al registrarse. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="register-modal-overlay" onClick={onClose}>
      <div className="register-container" onClick={(e) => e.stopPropagation()}>
        <div className="register-card">
          <button className="register-close-button" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
          <div className="register-header">
            <h1>Crear Cuenta</h1>
            <p>Registro rápido para agendar tu cita</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombres">Nombres</label>
                <input
                  type="text"
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  className={errors.nombres ? 'input-error' : ''}
                  placeholder="Tus nombres"
                  disabled={isLoading}
                />
                {errors.nombres && <span className="error-message">{errors.nombres}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="apellidos">Apellidos</label>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className={errors.apellidos ? 'input-error' : ''}
                  placeholder="Tus apellidos"
                  disabled={isLoading}
                />
                {errors.apellidos && <span className="error-message">{errors.apellidos}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dni">DNI</label>
              <input
                type="text"
                id="dni"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                className={errors.dni ? 'input-error' : ''}
                placeholder="12345678"
                maxLength={8}
                disabled={isLoading}
              />
              {errors.dni && <span className="error-message">{errors.dni}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
                placeholder="tu@email.com"
                disabled={isLoading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'input-error' : ''}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>

              {/* Lista visual de requisitos */}
              <ul className="password-requirements">
                {[
                  { label: 'Mínimo 8 caracteres', met: formData.password.length >= 8 },
                  { label: 'Una mayúscula', met: /[A-Z]/.test(formData.password) },
                  { label: 'Una minúscula', met: /[a-z]/.test(formData.password) },
                  { label: 'Un número', met: /\d/.test(formData.password) },
                  { label: 'Un carácter especial (!@#$...)', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) }
                ].map((req, idx) => (
                  <li key={idx} className={`requirement-item ${req.met ? 'met' : ''}`}>
                    <span className="requirement-icon">
                      {req.met ? '✓' : '•'}
                    </span>
                    {req.label}
                  </li>
                ))}
              </ul>

              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Siguiente: Iniciar Sesión'}
            </button>
          </form>

          <div className="register-footer">
            <p>¿Ya tienes una cuenta? <a href="#" onClick={(e) => {
              e.preventDefault();
              onClose();
              if (onSwitchToLogin) {
                setTimeout(() => onSwitchToLogin(), 100);
              }
            }}>Inicia sesión</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
