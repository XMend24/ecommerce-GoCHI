document.addEventListener("DOMContentLoaded", () => {
    const userRole = localStorage.getItem('userRole');
    
    // Seguridad: Si no es admin, lo sacamos de aquí
    if (userRole !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    cargarUsuarios();
});

async function cargarUsuarios() {
    const token = localStorage.getItem('token');
    const tabla = document.querySelector('#tabla-usuarios-body');
    
    if (!tabla) return;

    try {
        const response = await fetch('/api/auth/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const usuarios = await response.json();

        tabla.innerHTML = "";

        usuarios.forEach(user => {
            // No permitimos que el admin se bloquee a sí mismo por error
            const esMismoUsuario = user.email === localStorage.getItem('userEmail');
            
            tabla.innerHTML += `
                <tr>
                    <td>${user.nombre}</td>
                    <td>${user.email}</td>
                    <td>
                        <select class="select-admin" onchange="actualizarUsuario(${user.id}, this.value, '${user.estatus}')" ${esMismoUsuario ? 'disabled' : ''}>
                            <option value="usuario" ${user.role === 'usuario' ? 'selected' : ''}>Usuario</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </td>
                    <td>
                        <span class="status-badge ${user.estatus}">${user.estatus}</span>
                    </td>
                    <td>
                        <button class="btn-status ${user.estatus === 'activo' ? 'btn-block' : 'btn-unblock'}" 
                                onclick="actualizarUsuario(${user.id}, '${user.role}', '${user.estatus === 'activo' ? 'bloqueado' : 'activo'}')"
                                ${esMismoUsuario ? 'style="display:none"' : ''}>
                            ${user.estatus === 'activo' ? '<i class="bi bi-lock"></i> Bloquear' : '<i class="bi bi-unlock"></i> Activar'}
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
    }
}

async function actualizarUsuario(id, role, estatus) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/auth/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role, estatus })
        });

        if (response.ok) {
            cargarUsuarios(); // Recargamos la lista para ver los cambios
        } else {
            alert("Error al actualizar usuario");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}