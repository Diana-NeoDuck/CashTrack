document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simulación de autenticación (en una aplicación real, esto se haría con backend)
        if (username && password) {
            // Guardar información del usuario en localStorage para simular una sesión
            localStorage.setItem('cashtrack_user', JSON.stringify({
                username: username,
                name: 'Usuario Demo',
                role: 'Administrador'
            }));
            
            // Redirigir al dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Por favor ingrese usuario y contraseña');
        }
    });
});