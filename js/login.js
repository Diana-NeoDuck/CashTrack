document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    // Verificar si el usuario ya está autenticado
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Usuario ya autenticado, redirigir al dashboard
            window.location.href = 'dashboard.html';
        }
    });
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Mostrar indicador de carga
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
        submitBtn.disabled = true;
        
        // Autenticación con Firebase
        firebase.auth().signInWithEmailAndPassword(username, password)
            .then((userCredential) => {
                // Autenticación exitosa
                const user = userCredential.user;
                
                // Obtener datos adicionales del usuario desde la base de datos
                firebase.database().ref('users/' + user.uid).once('value')
                    .then((snapshot) => {
                        const userData = snapshot.val() || {};
                        
                        // Guardar información del usuario en localStorage
                        localStorage.setItem('cashtrack_user', JSON.stringify({
                            uid: user.uid,
                            email: user.email,
                            name: userData.name || 'Usuario',
                            role: userData.role || 'Usuario'
                        }));
                        
                        // Redirigir al dashboard
                        window.location.href = 'dashboard.html';
                    });
            })
            .catch((error) => {
                // Restaurar botón
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Manejar errores de autenticación
                let errorMessage = 'Error al iniciar sesión. Intente nuevamente.';
                
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    errorMessage = 'Usuario o contraseña incorrectos.';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Demasiados intentos fallidos. Intente más tarde.';
                }
                
                alert(errorMessage);
                console.error(error);
            });
    });
    
    // Agregar opción para crear cuenta (opcional)
    const createAccountLink = document.createElement('p');
    createAccountLink.className = 'text-center mt-3';
    createAccountLink.innerHTML = '¿No tienes cuenta? <a href="#" id="createAccountBtn">Crear cuenta</a>';
    loginForm.parentNode.appendChild(createAccountLink);
    
    document.getElementById('createAccountBtn').addEventListener('click', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            alert('Por favor ingrese un correo electrónico y contraseña para registrarse.');
            return;
        }
        
        if (password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        
        // Crear cuenta con Firebase
        firebase.auth().createUserWithEmailAndPassword(username, password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                // Crear registro del usuario en la base de datos
                firebase.database().ref('users/' + user.uid).set({
                    email: username,
                    name: 'Usuario Nuevo',
                    role: 'Usuario',
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                })
                .then(() => {
                    alert('Cuenta creada exitosamente. Ahora puede iniciar sesión.');
                });
            })
            .catch((error) => {
                let errorMessage = 'Error al crear cuenta. Intente nuevamente.';
                
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'Este correo electrónico ya está en uso.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Correo electrónico inválido.';
                }
                
                alert(errorMessage);
                console.error(error);
            });
    });
});