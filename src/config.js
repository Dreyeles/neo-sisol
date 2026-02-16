let base = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
    || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    || 'http://localhost:5000';

// Si la base es exactamente "/api", la dejamos vacía porque los componentes
// ya le agregan "/api" al principio de cada ruta por convención.
if (base === '/api') {
    base = '';
}

export default base;
