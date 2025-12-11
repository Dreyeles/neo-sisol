import React, { useState, useEffect } from 'react';
import './Login.css';

const Login = ({ isOpen = false, onClose = () => { }, onSwitchToRegister, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6 && formData.password !== '123') {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
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

    // Petición real de login
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.status === 'OK') {
        const userData = data.data;
        // Adaptar estructura si es necesario para el frontend
        const adaptedUser = {
          email: userData.email,
          nombre: userData.nombres || userData.nombre || 'Usuario',
          role: userData.tipo_usuario === 'medico' ? 'doctor' : userData.tipo_usuario === 'administrativo' ? 'admin' : 'patient',
          id: userData.id_usuario,
          // Guardar IDs específicos según rol
          id_paciente: userData.id_paciente,
          id_medico: userData.id_medico,
          id_administrativo: userData.id_personal_administrativo,
          // Datos completos por si acaso
          ...userData
        };

        console.log('Login exitoso:', adaptedUser);

        // Llamar a la función de éxito del login
        if (onLoginSuccess) {
          onLoginSuccess(adaptedUser);
        }

        // Cerrar modal después de login exitoso
        onClose();
      } else {
        alert('Error al iniciar sesión: ' + data.message);
      }
    } catch (error) {
      console.error('Error en el login:', error);
      alert('Error de conexión al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-container" onClick={(e) => e.stopPropagation()}>
        <div className="login-card">
          <button className="login-close-button" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
          <div className="login-header">
            <h1>Bienvenido</h1>
            <p>Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
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
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>
              <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="login-footer">
            <p>¿No tienes una cuenta? <a href="#" onClick={(e) => {
              e.preventDefault();
              onClose();
              if (onSwitchToRegister) {
                setTimeout(() => onSwitchToRegister(), 100);
              }
            }}>Regístrate</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
