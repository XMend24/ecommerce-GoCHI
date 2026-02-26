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
