import React from 'react';
// import { Lock } from 'lucide-react';
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
                  <img src="/lightning-icon.png" alt="Más rápido" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                </div>
                <div className="card-text">Más rápido</div>
              </div>
              <div className="floating-card card-2">
                <div className="card-icon">
                  <img src="/cursor-icon.png" alt="Más fácil" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                </div>
                <div className="card-text">Más fácil</div>
              </div>
              <div className="floating-card card-3">
                <div className="card-icon">
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      marginTop: '5px',
                      backgroundColor: '#1e3a8a',
                      maskImage: 'url(/secure-lock.png)',
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      WebkitMaskImage: 'url(/secure-lock.png)',
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center'
                    }}
                    role="img"
                    aria-label="Más seguro"
                  />
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

