const formProducto = document.querySelector("#form-producto");
const token = localStorage.getItem('token');

// --- 1. CARGA INICIAL: Detectar si estamos editando o creando ---
document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId) {
        // Configuramos la vista para EDICIÓN
        document.querySelector(".titulo-principal").innerText = "Editar Producto";
        const btnSubmit = document.querySelector("#btn-guardar") || document.querySelector("button[type='submit']");
        if (btnSubmit) btnSubmit.innerText = "Actualizar Producto";

        // Cargamos los datos en el formulario
        await cargarDatosParaEditar(editId);
    }

    // Cargamos la bitácora siempre al inicio
    cargarBitacora();
});

// Función para rellenar los inputs si es una edición
async function cargarDatosParaEditar(id) {
    try {
        const response = await fetch(`/api/products/${id}`);
        const producto = await response.json();

        if (response.ok) {
            // Usamos || (o) para aceptar ambos nombres posibles
            document.getElementById('nombre').value = producto.nombre || producto.titulo || "";
            document.getElementById('precio').value = producto.precio || "";
            document.getElementById('descripcion').value = producto.descripcion || "";
            document.getElementById('imagen_url').value = producto.imagen_url || producto.imagen || "";
            document.getElementById('categoria').value = producto.categoria || "";
            
            // MUY IMPORTANTE: Guardar el ID en el dataset del formulario
            // Asegúrate de que el ID del formulario sea el correcto
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

    const editId = formProducto.dataset.editId; // ¿Tenemos un ID de edición?
    
    const confirmar = confirm(editId 
        ? "¿Estás seguro de actualizar este producto?" 
        : "¿Estás seguro de que todos los datos son correctos? El producto se publicará inmediatamente.");
    
    if (!confirmar) return;

    const productoData = {
        nombre: document.querySelector("#nombre").value,
        precio: document.querySelector("#precio").value,
        descripcion: document.querySelector("#descripcion").value,
        imagen_url: document.querySelector("#imagen_url").value,
        categoria: document.querySelector("#categoria").value
    };

    // Definimos URL y MÉTODO dinámicamente
    const metodo = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/products/${editId}` : '/api/products';

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productoData)
        });

        const data = await response.json();

        if (response.ok) {
            alert(editId ? "✅ ¡Producto actualizado!" : "🚀 ¡Producto subido con éxito!");
            window.location.href = "index.html";
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
        contenedor.innerHTML = ""; 

        logs.forEach(log => {
            const div = document.createElement("div");
            div.classList.add("log-entry");
            
            // Formateamos la fecha para que ocupe menos espacio
            const fechaObj = new Date(log.createdAt);
            const fechaFormateada = fechaObj.toLocaleDateString() + " " + fechaObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            // Usamos colores según el tipo de acción para identificar rápido
            let colorAccion = "#2c3e50"; // Color por defecto
            if (log.accion.includes("ELIMINAR")) colorAccion = "#e74c3c"; // Rojo
            if (log.accion.includes("EDITAR")) colorAccion = "#f39c12";   // Naranja
            if (log.accion.includes("CREADO")) colorAccion = "#27ae60";   // Verde

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