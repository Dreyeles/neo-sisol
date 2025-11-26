import React from 'react';
import { Heart, Shield, Users, Clock } from 'lucide-react';
import './AcercaDe.css';

const AcercaDe = () => {
    const features = [
        {
            icon: <Heart size={32} className="feature-icon" />,
            title: "Compromiso",
            description: "Dedicados a brindar atención médica de calidad con calidez humana."
        },
        {
            icon: <Shield size={32} className="feature-icon" />,
            title: "Confianza",
            description: "Respaldo de años de experiencia y profesionales altamente calificados."
        },
        {
            icon: <Users size={32} className="feature-icon" />,
            title: "Accesibilidad",
            description: "Servicios de salud al alcance de todos, en múltiples sedes."
        },
        {
            icon: <Clock size={32} className="feature-icon" />,
            title: "Eficiencia",
            description: "Procesos optimizados para reducir tiempos de espera y mejorar tu experiencia."
        }
    ];

    return (
        <section className="acerca-de" id="acerca">
            <div className="acerca-container">
                <div className="acerca-header">
                    <h2 className="acerca-title">Acerca de Neo SISOL</h2>
                    <div className="acerca-divider"></div>
                    <p className="acerca-description">
                        Somos una institución comprometida con la salud integral de la comunidad.
                        Nuestra misión es proporcionar servicios médicos accesibles, oportunos y de calidad,
                        utilizando tecnología moderna y un equipo humano vocacional.
                    </p>
                </div>

                <div className="acerca-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="acerca-card">
                            <div className="icon-wrapper">
                                {feature.icon}
                            </div>
                            <h3 className="card-title">{feature.title}</h3>
                            <p className="card-description">{feature.description}</p>
                        </div>
                    ))}
                </div>

                <div className="acerca-stats-banner">
                    <div className="stat-box">
                        <span className="stat-number">20+</span>
                        <span className="stat-label">Años de Experiencia</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-number">40+</span>
                        <span className="stat-label">Sedes en Lima</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-number">1M+</span>
                        <span className="stat-label">Atenciones Anuales</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AcercaDe;
