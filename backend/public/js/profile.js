window.onload = function() {
    const token = localStorage.getItem('token');
    
    // 1. Verificación de seguridad
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // 2. CARGAR DATOS ACTUALES EN LOS INPUTS
    // Obtenemos lo que guardamos en el login
    const nombreGuardado = localStorage.getItem('userEmail'); // O 'userName' si lo tienes
    const emailGuardado = localStorage.getItem('userEmail');

    if (nombreGuardado) {
        document.getElementById('name').value = nombreGuardado.split('@')[0];
    }
    
    if (emailGuardado && document.getElementById('email')) {
        document.getElementById('email').value = emailGuardado;
    }
};

async function updateProfile() {
    const name = document.getElementById('name').value;
    const password = document.getElementById('new-password').value; 
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/auth/update-profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, password })
        });
        
        const data = await response.json();

        if (response.ok) {
            // Guardamos el nuevo nombre para que main.js lo pueda leer
            localStorage.setItem('userEmail', name + "@gmail.com"); 
            
            alert('¡Cambios guardados con éxito!');
            window.location.href = 'index.html'; 
        } else {
            alert('Error: ' + (data.error || 'No se pudo actualizar'));
        }
    } catch (error) {
        console.error("Error:", error);
        alert('Error de conexión con el servidor. Revisa la consola (F12).');
    }
}

function logout() {
    localStorage.clear(); 
    window.location.href = 'login.html';
}