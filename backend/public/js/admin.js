document.querySelector("#form-producto").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const nuevoProducto = {
        nombre: document.querySelector("#nombre").value,
        precio: document.querySelector("#precio").value,
        descripcion: document.querySelector("#descripcion").value,
        imagen_url: document.querySelector("#imagen_url").value,
        categoria: document.querySelector("#categoria").value
    };

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(nuevoProducto)
        });

        const data = await response.json();

        if (response.ok) {
            alert("🚀 ¡Producto subido con éxito!");
            window.location.href = "index.html";
        } else {
            alert("Error: " + data.error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el servidor.");
    }
});