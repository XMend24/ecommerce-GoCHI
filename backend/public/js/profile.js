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
    const token = localStorage.getItem('token');

    // Validación simple
    if (!name.trim()) {
        alert("El nombre no puede estar vacío");
        return;
    }

    try {
        // 3. RUTA CORREGIDA: Usamos una ruta de actualización, no de registro
        const response = await fetch('/api/auth/update-profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });
        
        const data = await response.json();

        if (response.ok) {
            // 4. ACTUALIZAR LOCALSTORAGE
            // Esto es vital para que la tienda no siga diciendo "undefined"
            localStorage.setItem('userEmail', name + "@cambiado.com"); // Ajusta según tu lógica
            
            alert('¡Perfil actualizado con éxito!');
            window.location.href = 'index.html'; // Volvemos a la tienda para ver los cambios
        } else {
            alert('Error: ' + (data.error || 'No se pudo actualizar'));
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert('Error de conexión con el servidor');
    }
}

function logout() {
    localStorage.clear(); 
    window.location.href = 'login.html';
}