// --- 1. Variables Globales ---
let productos = []; 
const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector(".titulo-principal");

// --- 2. Carga Inicial ---
async function cargarProductosDesdeBD() {
    try {
        const response = await fetch('https://ecommerce-gochi.onrender.com/api/products');
        productos = await response.json();
        
        // Al cargar la página, mostramos "Todos" por defecto
        renderizarProductos(productos); 
        
        // Activamos los escuchadores de los botones del menú
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
        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
            <img class="producto-imagen" src="${producto.imagen || './img/abrigos/accesorio1.jpeg'}" alt="${producto.titulo}">
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo}</h3>
                <p class="producto-precio">$${producto.precio}</p>
                <button class="producto-agregar" onclick="addToCart(${producto.id})">Agregar</button>
            </div>
        `;
        contenedorProductos.append(div);
    });
}

// --- 4. Lógica de los botones de Pulseras y Rosarios ---
function configurarFiltros() {
    botonesCategorias.forEach(boton => {
        boton.addEventListener("click", (e) => {
            botonesCategorias.forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");

            const textoBoton = e.currentTarget.innerText.trim().toLowerCase();

            if (textoBoton !== "todos los productos") {
                const productosFiltrados = productos.filter(p => {
                    // Si el producto no tiene categoría, lo ignoramos
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

cargarProductosDesdeBD();

async function addToCart(productoId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert("Debes iniciar sesión para agregar productos.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/carrito', {
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
            console.error("Error del servidor:", data.error);
            alert("No se pudo agregar: " + data.error);
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("Error de conexión con el servidor.");
    }
}
// Iniciar carga
cargarProductosDesdeBD();