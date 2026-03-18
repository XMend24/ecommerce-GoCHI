// --- 1. Variables Globales ---
let productos = []; 
let paginaActual = 1;
let categoriaActual = 'Todos';
const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector(".titulo-principal");

const BASE_URL = '/api';

// --- 2. Carga Inicial ---
async function cargarProductosDesdeBD() {
    try {
        console.log("Intentando cargar productos...");
        const response = await fetch(`${BASE_URL}/products`);
        productos = await response.json();
        
        console.log("Productos recibidos:", productos); // Para verificar en la consola (F12)

        renderizarProductos(productos); 
        configurarFiltros(); 
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

// --- 3. Función para dibujar en el HTML ---
function renderizarProductos(productosElegidos) {
    if (!contenedorProductos) return;
    contenedorProductos.innerHTML = "";

    // 1. OBTENEMOS EL ROL DEL USUARIO
    const userRole = localStorage.getItem('userRole');

    productosElegidos.forEach(producto => {
        const imagenFinal = (producto.imagen && producto.imagen.trim() !== "") 
                            ? producto.imagen 
                            : './img/abrigos/accesorio1.jpeg';

        // 2. CREAMOS LOS BOTONES SOLO SI ES ADMIN
        let botonesAdmin = "";
        if (userRole === 'admin') {
            botonesAdmin = `
                <div class="admin-controls">
                    <button class="btn-edit" onclick="prepararEdicion(${producto.id})"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn-delete" onclick="eliminarProducto(${producto.id})"><i class="bi bi-trash"></i></button>
                </div>
            `;
        }

        const div = document.createElement("div");
        div.classList.add("producto-card");
        div.innerHTML = `
            <div class="producto-imagen-container">
                ${botonesAdmin} 
                <img class="producto-imagen" src="${imagenFinal}" alt="${producto.titulo}">
            </div>
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo}</h3>
                <p class="producto-precio">$${producto.precio}</p>
                <button class="producto-agregar" onclick="addToCart(${producto.id})">Agregar</button>
            </div>
        `;
        contenedorProductos.append(div);
    });
}

// --- 4. Lógica de filtros ---
function configurarFiltros() {
    botonesCategorias.forEach(boton => {
        boton.addEventListener("click", (e) => {
            // 1. Cambiamos la clase active
            botonesCategorias.forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");

            // 2. Obtenemos el ID (Todos, Pulseras o Rosarios)
            const categoriaElegida = e.currentTarget.id; 
            
            // 3. Actualizamos el título visual
            tituloPrincipal.innerText = e.currentTarget.innerText;
            
            // 4. Pedimos al servidor los productos de esa categoría (Página 1)
            cargarProductos(categoriaElegida, 1);
        });
    });
}

// --- 5. Agregar al Carrito (URL CORREGIDA) ---
async function addToCart(productoId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert("Debes iniciar sesión para agregar productos.");
        window.location.href = "login.html";
        return;
    }  
    const productoEncontrado = productos.find(p => p.id === productoId);
    const nombreProducto = productoEncontrado ? productoEncontrado.titulo : "Producto desconocido";
    try {
        const response = await fetch(`${BASE_URL}/carrito`, { // URL DE RENDER
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                producto_id: productoId,
                cantidad: 1
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Producto agregado al carrito con éxito");
        } else {
            alert("No se pudo agregar: " + (data.error || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("Error de conexión con el servidor.");
    }
}

function configurarMenuUsuario() {
    const userMenuBtn = document.querySelector("#user-menu-btn");
    const userMenuDropdown = document.querySelector("#user-menu-dropdown");
    const nameDisplay = document.querySelector("#user-name-display");
    const adminLink = document.querySelector("#admin-link");
    const logoutBtn = document.querySelector("#cerrar-sesion-btn");

    // 1. Obtener datos del usuario (Asegúrate de guardar 'userEmail' y 'userRole' en el login)
    const userName = localStorage.getItem('userName') || "Usuario";
    const userRole = localStorage.getItem('userRole'); // 'admin' o 'user'

    nameDisplay.innerText = userName;

    // 2. Mostrar Panel Admin solo si es administrador
    if (userRole === 'admin') {
        adminLink.style.display = "flex";
    }

    // 3. Toggle del menú (Abrir/Cerrar)
    userMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        userMenuDropdown.classList.toggle("active");
    });

    // Cerrar al hacer clic afuera
    document.addEventListener("click", () => {
        userMenuDropdown.classList.remove("active");
    });

    // 4. Lógica de Cerrar Sesión
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "login.html";
    });
}
// --- FUNCION ELIMINAR ---
async function eliminarProducto(id) {
    const token = localStorage.getItem('token');
    if (!confirm("¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.")) return;

    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert("Producto eliminado");
            location.reload(); // Recargamos para ver los cambios
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// --- FUNCION EDITAR (Redirigir al panel con los datos) ---
function prepararEdicion(id) {
    window.location.href = `admin.html?edit=${id}`;
}

// --- FUNCION PAGINADOR---
async function cargarProductos(categoria = 'Todos', pagina = 1) {
    categoriaActual = categoria;
    paginaActual = pagina;

    const res = await fetch(`/api/products?categoria=${categoria}&page=${pagina}`);
    const data = await res.json();

    productos = data.products;

    renderizarProductos(data.products); 
    renderizarPaginacion(data.totalPages, data.currentPage);
}

function renderizarPaginacion(total, actual) {
    const contenedor = document.querySelector('#contenedor-paginacion');
    contenedor.innerHTML = '';

    for (let i = 1; i <= total; i++) {
        const boton = document.createElement('button');
        boton.innerText = i;
        boton.classList.add('boton-paginacion');
        if (i === actual) boton.classList.add('active');

        boton.addEventListener('click', () => {
            cargarProductos(categoriaActual, i);
            window.scrollTo(0, 0); 
        });
        contenedor.appendChild(boton);
    }
}

// --- ARRANQUE DE LA APLICACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Encendemos el menú del usuario
    if (typeof configurarMenuUsuario === "function") {
        configurarMenuUsuario();
    }
    
    // 2. Encendemos los botones de categorías (Pulseras, Rosarios)
    if (typeof configurarFiltros === "function") {
        configurarFiltros(); 
    }
    
    // 3. Traemos los productos de la página 1
    if (typeof cargarProductos === "function") {
        cargarProductos('Todos', 1); 
    }
});