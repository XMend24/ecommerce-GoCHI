document.addEventListener("DOMContentLoaded", () => {
    cargarCarrito();
});

async function cargarCarrito() {
    const token = localStorage.getItem('token');
    
    // Si no hay token, mandamos al login
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch('/api/carrito', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const items = await response.json();
        renderizarCarrito(items);
    } catch (error) {
        console.error("Error al cargar carrito:", error);
    }
}

function renderizarCarrito(items) {
    const contenedorCarrito = document.querySelector("#contenedor-carrito");
    const accionesCarrito = document.querySelector(".carrito-acciones");
    const totalElemento = document.querySelector("#total");
    
    if (!contenedorCarrito) return;

    // ESTADO 1: Si el carrito está vacío en la base de datos
    if (items.length === 0) {
        contenedorCarrito.innerHTML = `
            <div class="carrito-vacio-contenedor">
                <p class="carrito-vacio">Tu carrito está vacío <i class="bi bi-emoji-frown"></i></p>
                <a href="index.html" class="boton-volver-tienda">Volver a la tienda</a>
            </div>
        `;
        if (accionesCarrito) accionesCarrito.style.display = "none";
        return;
    }

    // ESTADO 2: Si hay productos, mostramos las acciones y renderizamos los items
    if (accionesCarrito) accionesCarrito.style.display = "flex";
    contenedorCarrito.innerHTML = "";
    let totalAcumulado = 0;

    items.forEach(item => {
        totalAcumulado += item.precio * item.cantidad;
        
        const div = document.createElement("div");
        div.classList.add("carrito-producto");
        div.innerHTML = `
            <img class="carrito-producto-imagen" src="${item.imagen || './img/abrigos/accesorio1.jpeg'}" alt="${item.titulo}">
            <div class="carrito-producto-titulo">
                <small>Título</small>
                <h3>${item.titulo}</h3>
            </div>
            <div class="carrito-producto-cantidad">
                <small>Cantidad</small>
                <p>${item.cantidad}</p>
            </div>
            <div class="carrito-producto-precio">
                <small>Precio</small>
                <p>$${item.precio}</p>
            </div>
            <div class="carrito-producto-subtotal">
                <small>Subtotal</small>
                <p>$${(item.precio * item.cantidad).toFixed(2)}</p>
            </div>
            <button class="carrito-producto-eliminar" onclick="eliminarDelCarrito(${item.carrito_id})">
                <i class="bi bi-trash-fill"></i>
            </button>
        `;
        contenedorCarrito.append(div);
    });

    if (totalElemento) {
        totalElemento.innerText = `$${totalAcumulado.toFixed(2)}`;
    }
}

// Función para eliminar un producto específico (DELETE)
async function eliminarDelCarrito(carritoId) {
    const token = localStorage.getItem('token');
    
    // Capturamos el nombre del producto para la bitácora
    const boton = event.target.closest('button');
    const contenedorProducto = boton.closest('.carrito-producto');
    const nombreProducto = contenedorProducto.querySelector('h3').innerText;

    if (!confirm(`¿Seguro que quieres quitar "${nombreProducto}"?`)) return;

    try {
        const response = await fetch(`/api/carrito/${carritoId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' // Crucial para que el backend lea el body
            },
            body: JSON.stringify({ nombre_producto: nombreProducto }) 
        });

        if (response.ok) {
            // Importante: No solo llamar a cargarCarrito, sino verificar que el DOM se actualice
            await cargarCarrito(); 
        } else {
            console.error("Error en la respuesta del servidor");
            alert("No se pudo eliminar el producto.");
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}

async function vaciarCarrito() {
    // 1. Confirmación de seguridad
    const confirmar = confirm("¿Estás seguro de que quieres quitar todos los productos del carrito?");
    if (!confirmar) return;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/carrito/vaciar/todo', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            // 2. Refrescamos la vista (ahora saldrá el mensaje de "Carrito vacío")
            cargarCarrito();
        } else {
            alert("No se pudo vaciar el carrito.");
        }
    } catch (error) {
        console.error("Error al vaciar:", error);
    }
}

function abrirCheckout() {
    const total = document.getElementById('total').innerText;
    
    // Validación básica: si no hay nada, no abrimos el modal
    if (total === "0" || total === "0.00" || total === "") {
        alert("Tu carrito está vacío.");
        return;
    }

    // Pasamos el total al modal para que el usuario lo vea
    document.getElementById('monto-final').innerText = total;
    
    // Mostramos el modal
    document.getElementById('modal-pago').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal-pago').style.display = 'none';
}

async function confirmarCompra(e) {
    if (e) e.preventDefault(); 

    const datosPago = {
        nombreCliente: document.getElementById('nombre-confirm').value,
        telefono: document.getElementById('tel-confirm').value,
        direccion: document.getElementById('dir-confirm').value,
        bancoOrigen: document.getElementById('banco-confirm').value,
        numeroReferencia: document.getElementById('ref-confirm').value,
        montoTotal: document.getElementById('total').innerText,
        // Usamos la función que ya tenías para obtener los productos
        carrito: JSON.stringify(obtenerCarritoLocal()) 
    };

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(datosPago)
        });

        const result = await response.json();

        if (response.ok) {
            alert('✅ ¡Pago enviado! El administrador revisará tu referencia pronto.');
            localStorage.removeItem('carrito'); 
            cerrarModal(); 
            window.location.href = 'index.html';
        } else {
            alert('❌ Error: ' + (result.error || 'No se pudo procesar el pago'));
        }
    } catch (error) {
        console.error("Error en el checkout:", error);
        alert('Hubo un fallo en la conexión al confirmar el pago.');
    }
}