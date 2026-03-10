window.onload = function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
};

async function updateProfile() {
const name = document.getElementById('name').value;
const token = localStorage.getItem('token');

try {
    const response = await fetch('/api/auth/register', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name })
    });
    
    const data = await response.json();
    if (response.ok) {
    alert('Perfil actualizado');
    } else {
    alert('Error: ' + data.error);
    }
} catch (error) {
    alert('Error de conexión: ' + error.message);
}
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = 'login.html';
}