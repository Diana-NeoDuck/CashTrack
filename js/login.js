document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerBtn = document.getElementById('registerBtn');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const createAccountBtn = document.getElementById('createAccountBtn');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    
    // Inicializar modales de Bootstrap
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    const forgotPasswordModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    
    // Verificar si el usuario ya está autenticado
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Usuario ya autenticado, redirigir al dashboard
            window.location.href = 'dashboard.html';
        }
    });
    
    // Evento para mostrar modal de registro
    registerBtn.addEventListener('click', function() {
        registerModal.show();
    });
    
    // Evento para mostrar modal de recuperación de contraseña
    forgotPasswordBtn.addEventListener('click', function() {
        forgotPasswordModal.show();
    });
    
    // Evento para crear cuenta
    createAccountBtn.addEventListener('click', function() {
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validaciones
        if (!email || !password || !confirmPassword) {
            showAlert('Por favor complete todos los campos', 'danger');
            return;
        }
        
        if (password !== confirmPassword) {
            showAlert('Las contraseñas no coinciden', 'danger');
            return;
        }
        
        if (password.length < 6) {
            showAlert('La contraseña debe tener al menos 6 caracteres', 'danger');
            return;
        }
        
        // Mostrar indicador de carga
        createAccountBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';
        createAccountBtn.disabled = true;
        
        // Crear cuenta con Firebase
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                // Crear registro del usuario en la base de datos
                firebase.database().ref('users/' + user.uid).set({
                    email: email,
                    name: 'Usuario Nuevo',
                    role: 'Usuario',
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                })
                .then(() => {
                    // Cerrar modal
                    registerModal.hide();
                    showAlert('Cuenta creada exitosamente. Ya puede iniciar sesión.', 'success');
                    
                    // Restaurar botón
                    createAccountBtn.innerHTML = 'Crear Cuenta';
                    createAccountBtn.disabled = false;
                    
                    // Limpiar formulario
                    document.getElementById('registerForm').reset();
                })
                .catch((error) => {
                    console.error('Error al guardar datos del usuario:', error);
                    showAlert('Error al crear la cuenta. Intente nuevamente.', 'danger');
                    
                    // Restaurar botón
                    createAccountBtn.innerHTML = 'Crear Cuenta';
                    createAccountBtn.disabled = false;
                });
            })
            .catch((error) => {
                // Restaurar botón
                createAccountBtn.innerHTML = 'Crear Cuenta';
                createAccountBtn.disabled = false;
                
                // Manejar errores
                let errorMessage = 'Error al crear la cuenta. Intente nuevamente.';
                
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'Este correo electrónico ya está en uso.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Correo electrónico inválido.';
                }
                
                showAlert(errorMessage, 'danger');
                console.error(error);
            });
    });
    
    // Evento para recuperar contraseña
    resetPasswordBtn.addEventListener('click', function() {
        const email = document.getElementById('resetEmail').value;
        
        if (!email) {
            showAlert('Por favor ingrese su correo electrónico', 'danger', 'forgotPasswordModal');
            return;
        }
        
        // Mostrar indicador de carga
        resetPasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        resetPasswordBtn.disabled = true;
        
        // Enviar correo de recuperación
        firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                // Cerrar modal
                forgotPasswordModal.hide();
                showAlert('Se ha enviado un enlace de recuperación a su correo electrónico', 'success');
                
                // Restaurar botón
                resetPasswordBtn.innerHTML = 'Enviar Enlace';
                resetPasswordBtn.disabled = false;
                
                // Limpiar formulario
                document.getElementById('forgotPasswordForm').reset();
            })
            .catch((error) => {
                // Restaurar botón
                resetPasswordBtn.innerHTML = 'Enviar Enlace';
                resetPasswordBtn.disabled = false;
                
                // Manejar errores
                let errorMessage = 'Error al enviar el enlace. Intente nuevamente.';
                
                if (error.code === 'auth/user-not-found') {
                    errorMessage = 'No existe una cuenta con este correo electrónico.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Correo electrónico inválido.';
                }
                
                showAlert(errorMessage, 'danger', 'forgotPasswordModal');
                console.error(error);
            });
    });
    
    // Evento para iniciar sesión
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
                
                showAlert(errorMessage, 'danger');
                console.error(error);
            });
    });
                    showAlert('Cuenta creada exitosamente. Ahora puede iniciar sesión.', 'success');
                 });
                 
// Función para mostrar alertas
function showAlert(message, type, modalId = null) {
    // Crear elemento de alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Determinar dónde mostrar la alerta
    let container;
    if (modalId) {
        // Mostrar dentro de un modal
        container = document.querySelector(`#${modalId} .modal-body`);
        container.prepend(alertDiv);
    } else {
        // Mostrar en la página principal
        container = document.querySelector('.login-header');
        container.after(alertDiv);
    }
    
    // Eliminar la alerta después de 5 segundos
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}
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