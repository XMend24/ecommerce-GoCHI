document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.querySelector("#register-form"); 

    if (!registerForm) return;

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault(); 

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            console.log("Enviando registro para:", email);

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();

            if (response.ok) {
                alert('¡Usuario registrado con éxito! Ahora puedes iniciar sesión.');
                window.location.href = 'login.html';
            } else {
                alert('Error: ' + (data.error || 'No se pudo completar el registro'));
            }
        } catch (error) {
            console.error("Error de red:", error);
            alert('Error de conexión: El servidor no responde.');
        }
    });
});