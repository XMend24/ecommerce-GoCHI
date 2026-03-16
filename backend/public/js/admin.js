const formProducto = document.querySelector("#form-producto");
const token = localStorage.getItem('token');

// --- 1. CARGA INICIAL: Detectar si estamos editando o creando ---
document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId) {
        document.querySelector(".titulo-principal").innerText = "Editar Producto";
        const btnSubmit = document.querySelector("#btn-guardar") || document.querySelector("button[type='submit']");
        if (btnSubmit) btnSubmit.innerText = "Actualizar Producto";

        await cargarDatosParaEditar(editId);
    }

    cargarBitacora();
});

// Función para rellenar los inputs si es una edición
async function cargarDatosParaEditar(id) {
    try {
        const response = await fetch(`/api/products/${id}`);
        const producto = await response.json();

        if (response.ok) {
            document.getElementById('nombre').value = producto.nombre || producto.titulo || "";
            document.getElementById('precio').value = producto.precio || "";
            document.getElementById('descripcion').value = producto.descripcion || "";
            document.getElementById('categoria').value = producto.categoria || "";
            
            const form = document.querySelector("#form-producto");
            form.dataset.editId = id;

            console.log("Datos cargados correctamente para el ID:", id);
        } else {
            console.error("Error al obtener producto:", producto.error);
        }
    } catch (error) {
        console.error("Error en la petición de carga:", error);
    }
}

// --- 2. EVENTO SUBMIT: Decidir si hacemos POST (Crear) o PUT (Editar) ---
formProducto.addEventListener("submit", async (e) => {
    e.preventDefault();

    const editId = formProducto.dataset.editId; 
    
    const confirmar = confirm(editId 
        ? "¿Estás seguro de actualizar este producto?" 
        : "¿Estás seguro de que todos los datos son correctos? El producto se publicará inmediatamente.");
    
    if (!confirmar) return;

    // --- CAMBIO PRINCIPAL: Usamos FormData para empaquetar archivos ---
    const formData = new FormData();
    formData.append('nombre', document.querySelector("#nombre").value);
    formData.append('precio', document.querySelector("#precio").value);
    formData.append('descripcion', document.querySelector("#descripcion").value);
    formData.append('categoria', document.querySelector("#categoria").value);

    // Capturamos el archivo físico
    // Ojo: Asegúrate de que en tu HTML el input de la imagen tenga id="imagenProducto"
    const inputImagen = document.querySelector("#imagenProducto");
    if (inputImagen && inputImagen.files.length > 0) {
        // 'imagen' es el nombre del campo que esperará Multer en el backend
        formData.append('imagen', inputImagen.files[0]);
    }

    const metodo = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/products/${editId}` : '/api/products';

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            // Enviamos el objeto FormData directamente
            body: formData 
        });

        const data = await response.json();

        if (response.ok) {
            alert(editId ? "✅ ¡Producto actualizado!" : "🚀 ¡Producto subido con éxito!");
            window.location.reload(); // Recarga la página para ver los cambios en la tabla
        } else {
            alert("Error: " + data.error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el servidor.");
    }
});

// --- 3. LÓGICA DE LA BITÁCORA ---
async function cargarBitacora() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/bitacora', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        let logs = await response.json();

        const contenedor = document.querySelector("#tabla-bitacora");
        if(!contenedor) return; 
        contenedor.innerHTML = ""; 

        logs.forEach(log => {
            const div = document.createElement("div");
            div.classList.add("log-entry");
            
            const fechaObj = new Date(log.createdAt);
            const fechaFormateada = fechaObj.toLocaleDateString() + " " + fechaObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            let colorAccion = "#2c3e50"; 
            if (log.accion.includes("ELIMINAR")) colorAccion = "#e74c3c"; 
            if (log.accion.includes("EDITAR")) colorAccion = "#f39c12";  
            if (log.accion.includes("CREADO")) colorAccion = "#27ae60";  

            div.innerHTML = `
                <span class="log-fecha" style="color: #7f8c8d; font-weight: 500;">${fechaFormateada}</span>
                <span class="log-accion" style="color: ${colorAccion}; font-weight: bold;">${log.accion}</span>
                <span class="log-desc" style="color: #34495e;">${log.descripcion}</span>
            `;
            contenedor.appendChild(div);
        });
    } catch (error) {
        console.error("Error al cargar bitácora", error);
    }
}