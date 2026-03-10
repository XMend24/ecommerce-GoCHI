const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log("Intentando iniciar sesión para:", email);

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();

        if (response.ok) {
            // Guardamos la sesión en el navegador
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role); 
            localStorage.setItem('userEmail', data.email);

            alert('✅ ¡Bienvenido a G☆CHI!');
            
            // Redirigir según el rol
            window.location.href = data.role === 'admin' ? 'admin.html' : 'index.html';
        } else {
            // El servidor nos dio un error (credenciales incorrectas, etc.)
            alert('❌ Error: ' + data.error);
        }
    } catch (error) {
        console.error("Error detallado:", error);
        alert('⚠️ Error de conexión: No se pudo contactar con el servidor.');
    }
});