import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Especialidades from './components/Especialidades';
import Servicios from './components/Servicios';
import AcercaDe from './components/AcercaDe';
import Contacto from './components/Contacto';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const [isServiciosOpen, setIsServiciosOpen] = useState(false);

  const handleOpenLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleOpenRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const handleCloseRegister = () => {
    setIsRegisterOpen(false);
  };

  const handleServiciosClick = () => {
    setIsServiciosOpen(true);
  };

  // Si el usuario está autenticado, mostrar el Dashboard correspondiente
  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return (
        <div className="App">
          <AdminDashboard user={user} onLogout={handleLogout} />
        </div>
      );
    }
    if (user?.role === 'doctor') {
      return (
        <div className="App">
          <DoctorDashboard user={user} onLogout={handleLogout} />
        </div>
      );
    }
    return (
      <div className="App">
        <Dashboard user={user} onLogout={handleLogout} />
      </div>
    );
  }

  // Si no está autenticado, mostrar la página principal
  return (
    <div className="App">
      <Navbar
        onLoginClick={handleOpenLogin}
        onRegisterClick={handleOpenRegister}
        onServiciosClick={handleServiciosClick}
      />
      <Hero onAgendarCitaClick={handleOpenLogin} />
      <Especialidades />
      <Servicios
        isOpen={isServiciosOpen}
        onToggle={() => setIsServiciosOpen(!isServiciosOpen)}
      />
      <AcercaDe />
      <Contacto />
      <Footer />
      <Login
        isOpen={isLoginOpen}
        onClose={handleCloseLogin}
        onSwitchToRegister={handleOpenRegister}
        onLoginSuccess={handleLoginSuccess}
      />
      <Register
        isOpen={isRegisterOpen}
        onClose={handleCloseRegister}
        onSwitchToLogin={handleOpenLogin}
      />
    </div>
  );
}

export default App;

