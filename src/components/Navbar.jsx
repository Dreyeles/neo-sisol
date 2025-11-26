import React, { useState } from 'react';
import './Navbar.css';

const Navbar = ({ onLoginClick, onRegisterClick, onServiciosClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLoginClick = () => {
    setIsMenuOpen(false);
    if (onLoginClick) {
      onLoginClick();
    }
  };

  const handleRegisterClick = () => {
    setIsMenuOpen(false);
    if (onRegisterClick) {
      onRegisterClick();
    }
  };

  const handleServiciosClick = () => {
    setIsMenuOpen(false);
    if (onServiciosClick) {
      onServiciosClick();
    }
  };

  const handleInicioClick = (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img src="/logo.svg" alt="Neo Sisol" className="logo-image" />
        </div>

        {/* Menu Desktop */}
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <a href="#inicio" className="navbar-link" onClick={handleInicioClick}>Inicio</a>
          </li>
          <li className="navbar-item">
            <a href="#servicios" className="navbar-link" onClick={handleServiciosClick}>Servicios</a>
          </li>
          <li className="navbar-item">
            <a href="#acerca" className="navbar-link" onClick={() => setIsMenuOpen(false)}>Acerca de</a>
          </li>
          <li className="navbar-item">
            <a href="#contacto" className="navbar-link" onClick={() => setIsMenuOpen(false)}>Contacto</a>
          </li>
        </ul>

        <div className="navbar-actions">
          <button
            className="navbar-button-secondary"
            onClick={handleRegisterClick}
          >
            Registrarse
          </button>
          <button
            className="navbar-button-primary"
            onClick={handleLoginClick}
          >
            Iniciar Sesión
          </button>
        </div>

        {/* Menu Mobile Toggle */}
        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className={isMenuOpen ? 'bar active' : 'bar'}></span>
          <span className={isMenuOpen ? 'bar active' : 'bar'}></span>
          <span className={isMenuOpen ? 'bar active' : 'bar'}></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

