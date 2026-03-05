// --- 1. Variables Globales ---
let productos = []; 
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

    productosElegidos.forEach(producto => {
        // Si imagen está vacío o es null, usamos la de repuesto
        const imagenFinal = (producto.imagen && producto.imagen.trim() !== "") 
                            ? producto.imagen 
                            : './img/abrigos/accesorio1.jpeg';

        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
            <img class="producto-imagen" src="${imagenFinal}" alt="${producto.titulo}">
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo}</h3>
                <p class="producto-precio">$${producto.precio}</p>
                <button class="producto-agregar" onclick="addToCart(${producto.id})">Agregar</button>
            </div>
        `;
        contenedorProductos.append(div);
    });
}

// --- 4. Lógica de filtros (Se mantiene igual, pero optimizada) ---
function configurarFiltros() {
    botonesCategorias.forEach(boton => {
        boton.addEventListener("click", (e) => {
            botonesCategorias.forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");

            const textoBoton = e.currentTarget.innerText.trim().toLowerCase();

            if (textoBoton !== "todos los productos") {
                const productosFiltrados = productos.filter(p => {
                    if (!p.categoria) return false;
                    const catProducto = p.categoria.trim().toLowerCase();
                    return textoBoton.includes(catProducto) || catProducto.includes(textoBoton);
                });
                
                tituloPrincipal.innerText = e.currentTarget.innerText;
                renderizarProductos(productosFiltrados);
            } else {
                tituloPrincipal.innerText = "Todos los productos";
                renderizarProductos(productos);
            }
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
document.addEventListener("DOMContentLoaded", () => {
    configurarMenuUsuario();
});

function configurarMenuUsuario() {
    const userMenuBtn = document.querySelector("#user-menu-btn");
    const userMenuDropdown = document.querySelector("#user-menu-dropdown");
    const nameDisplay = document.querySelector("#user-name-display");
    const adminLink = document.querySelector("#admin-link");
    const logoutBtn = document.querySelector("#cerrar-sesion-btn");

    // 1. Obtener datos del usuario (Asegúrate de guardar 'userEmail' y 'userRole' en el login)
    const userEmail = localStorage.getItem('userEmail') || "Usuario";
    const userRole = localStorage.getItem('userRole'); // 'admin' o 'user'

    // Cortar el email para mostrar solo el nombre antes del @
    nameDisplay.innerText = userEmail.split('@')[0];

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