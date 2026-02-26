Requisitos Previos
Node.js y npm: Instalados (versión 14+). Verifica con node -v y npm -v en terminal.
Carpeta del Proyecto: La carpeta debe estar en su laptop
Pasos para Ejecutar el Prototipo
Paso 1: Instalar Dependencias del Backend
Abre una terminal (Command Prompt en Windows) y navega a la carpeta backend dentro del Proyecto, Ejecuta npm install para instalar todas las dependencias (Express, Mongoose, etc.). Espera a que termine (1-2 minutos). Si hay errores, ejecuta npm install de nuevo
Paso 2: Configurar Variables de Entorno (.env)
En la carpeta backend, abre el archivo .env con un editor de texto (e.g., Notepad). Edita estas líneas con sus datos:
MONGO_URI=mongodb+srv://su_usuario:su_contraseña@su_cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=su_secreto_seguro_aqui_por_ejemplo_xyz456
Obtén MONGO_URI desde su cuenta de MongoDB Atlas (Connect > Connect your application > Node.js).
Para JWT_SECRET, usa una cadena aleatoria (e.g., "mi_secreto_unico_2023").
Guarda el archivo.
Paso 3: Ejecutar el Backend
En la terminal (desde backend/), ejecuta: node server.js
Deberías ver "Conectado a MongoDB" y "Servidor en puerto 5000". El backend estará corriendo en http://localhost:5000. No cierres la terminal; deja el servidor activo.
Paso 4: Ejecutar el Frontend
Abre otra terminal y navega a la carpeta frontend y Ejecuta un servidor local: npx serve . -p 3000
Alternativa: Si usan VS Code, instala "Live Server", abre frontend/ y clic derecho en index.html > "Open with Live Server".
