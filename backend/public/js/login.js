// Esperamos a que todo el HTML cargue antes de buscar el formulario
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login-form");

    if (!loginForm) {
        console.error("❌ ERROR: No se encontró el formulario con ID 'login-form'");
        return;
    }

    console.log("✅ Formulario detectado y listo.");

    loginForm.addEventListener("submit", async (e) => {
        // DETENER LA RECARGA (OBLIGATORIO)
        e.preventDefault(); 
        console.log("🚀 Intento de login iniciado...");

        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                console.log("🎉 Login exitoso", data);
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userEmail', data.email);

                alert("¡Bienvenido!");
                window.location.href = data.role === 'admin' ? 'admin.html' : 'index.html';
            } else {
                alert("❌ Error: " + (data.error || "Credenciales incorrectas"));
            }
        } catch (error) {
            console.error("❌ Error de red:", error);
            alert("Error de conexión con el servidor.");
        }
    });
});