document.querySelector("#form-producto").addEventListener("submit", async (e) => {
    e.preventDefault();

const confirmar = confirm("¿Estás seguro de que todos los datos son correctos? El producto se publicará inmediatamente.");
    
    if (!confirmar) {
        console.log("Publicación cancelada por el usuario");
        return; 
    }

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
async function cargarBitacora() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/bitacora', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const logs = await response.json();
        
        const contenedor = document.querySelector("#tabla-bitacora");
        contenedor.innerHTML = ""; // Limpiar mensaje de carga

        logs.forEach(log => {
            const div = document.createElement("div");
            div.classList.add("log-entry");
            const fecha = new Date(log.createdAt).toLocaleString();
            
            div.innerHTML = `
                <span class="log-fecha">${fecha}</span>
                <span class="log-accion">${log.accion}</span>
                <span class="log-desc">${log.descripcion}</span>
            `;
            contenedor.appendChild(div);
        });
    } catch (error) {
        console.error("Error al cargar bitácora", error);
    }
}

cargarBitacora();