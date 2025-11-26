import React from 'react';
import { Lock } from 'lucide-react';
import './Hero.css';

const Hero = ({ onAgendarCitaClick }) => {
  return (
    <section className="hero" id="inicio">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">Sistema Integral de Salud Ocupacional y Laboral</span>
            <h1 className="hero-title">
              Salud accesible, sin esperas
            </h1>
            <p className="hero-description">
              Agenda tus citas médicas en SISOL con nuestra nueva plataforma web: segura, rápida y pensada para todos.
            </p>
            <div className="hero-buttons">
              <button
                className="hero-button-primary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onAgendarCitaClick) {
                    onAgendarCitaClick();
                  }
                }}
              >
                Agendar Cita
              </button>
              <button
                className="hero-button-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                Conocer Más
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Pacientes</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Especialistas</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Atención</div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-container">
              <div className="medical-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="floating-card card-1">
                <div className="card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <div className="card-text">Más rápido</div>
              </div>
              <div className="floating-card card-2">
                <div className="card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
                  </svg>
                </div>
                <div className="card-text">Más fácil</div>
              </div>
              <div className="floating-card card-3">
                <div className="card-icon">
                  <Lock size={32} color="#1e3a8a" strokeWidth={1.5} />
                </div>
                <div className="card-text">Más seguro</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C150,100 350,100 600,50 C850,0 1050,100 1200,50 L1200,120 L0,120 Z" fill="white" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;

