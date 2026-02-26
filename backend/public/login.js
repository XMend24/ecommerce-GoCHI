async function login() {
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (response.ok) {
      // Guarda token y rol en localStorage para sesiones
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
      // Redirige según rol (user a index.html, admin a admin.html)
    window.location.href = data.role === 'admin' ? 'admin.html' : 'index.html';
    } else {
    alert('Error: ' + data.error);
    }
} catch (error) {
    alert('Error de conexión: ' + error.message);
}
}