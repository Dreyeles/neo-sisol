import React from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import './Contacto.css';

const Contacto = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica de envío del formulario
        alert('Mensaje enviado correctamente');
    };

    return (
        <section className="contacto" id="contacto">
            <div className="contacto-container">
                <div className="contacto-header">
                    <h2 className="contacto-title">Contáctanos</h2>
                    <div className="contacto-divider"></div>
                    <p className="contacto-description">
                        Estamos aquí para atenderte. Escríbenos o visítanos en nuestras sedes.
                    </p>
                </div>

                <div className="contacto-content">
                    {/* Información de Contacto */}
                    <div className="contacto-info">
                        <div className="info-card">
                            <h3 className="info-title">Información de Contacto</h3>
                            <div className="info-item">
                                <div className="info-icon">
                                    <MapPin size={24} />
                                </div>
                                <div className="info-text">
                                    <h4>Dirección</h4>
                                    <p>Lima, Perú</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon">
                                    <Phone size={24} />
                                </div>
                                <div className="info-text">
                                    <h4>Teléfono</h4>
                                    <p>+51 919 487 083</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon">
                                    <Mail size={24} />
                                </div>
                                <div className="info-text">
                                    <h4>Email</h4>
                                    <p>salud.ocupacional@sisol.gob.pe</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulario de Contacto */}
                    <div className="contacto-form-container">
                        <form className="contacto-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre Completo</label>
                                <input type="text" id="nombre" placeholder="Tu nombre" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Correo Electrónico</label>
                                <input type="email" id="email" placeholder="tu@email.com" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="asunto">Asunto</label>
                                <input type="text" id="asunto" placeholder="Motivo de tu mensaje" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="mensaje">Mensaje</label>
                                <textarea id="mensaje" rows="5" placeholder="¿En qué podemos ayudarte?" required></textarea>
                            </div>
                            <button type="submit" className="submit-button">
                                <span>Enviar Mensaje</span>
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contacto;
