async function register() {
const name = document.getElementById('name').value;
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

try {
    const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    if (response.ok) {
    alert('Usuario registrado. Ahora inicia sesión.');
    window.location.href = 'login.html';
    } else {
    alert('Error: ' + data.error);
    }
} catch (error) {
    alert('Error de conexión: ' + error.message);
}
}