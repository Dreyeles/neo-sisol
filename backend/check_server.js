import http from 'http';

const req = http.get('http://localhost:5000/api/health', (res) => {
    console.log('Status:', res.statusCode);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error('Error connecting to backend:', e.message);
});
