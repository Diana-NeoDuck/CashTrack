console.log('=== LOGIN.JS CARGADO ===');

// Función para validar formato de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM CARGADO ===');
    
    // Referencias a elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const registerBtn = document.getElementById('registerBtn');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const createAccountBtn = document.getElementById('createAccountBtn');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    
    console.log('Elementos encontrados:');
    console.log('- loginForm:', loginForm);
    console.log('- registerBtn:', registerBtn);
    console.log('- forgotPasswordBtn:', forgotPasswordBtn);
    console.log('- createAccountBtn:', createAccountBtn);
    console.log('- resetPasswordBtn:', resetPasswordBtn);
    
    // Verificar si Firebase está disponible
    if (typeof firebase !== 'undefined') {
        console.log('✅ Firebase disponible');
        
        // Verificar autenticación
        firebase.auth().onAuthStateChanged(function(user) {
            console.log('Estado de autenticación:', user ? 'Logueado' : 'No logueado');
            if (user) {
                console.log('Usuario logueado, redirigiendo...');
                window.location.href = 'dashboard.html';
            }
        });
    } else {
        console.error('❌ Firebase no está disponible');
    }
    
    // Verificar si Bootstrap está disponible
    if (typeof bootstrap !== 'undefined') {
        console.log('✅ Bootstrap disponible');
        
        // Inicializar modales de Bootstrap solo si los elementos existen
        const registerModalEl = document.getElementById('registerModal');
        const forgotPasswordModalEl = document.getElementById('forgotPasswordModal');
        
        let registerModal, forgotPasswordModal;
        
        if (registerModalEl) {
            registerModal = new bootstrap.Modal(registerModalEl);
            console.log('✅ Modal de registro inicializado');
        } else {
            console.error('❌ Elemento registerModal no encontrado');
        }
        
        if (forgotPasswordModalEl) {
            forgotPasswordModal = new bootstrap.Modal(forgotPasswordModalEl);
            console.log('✅ Modal de recuperación inicializado');
        } else {
            console.error('❌ Elemento forgotPasswordModal no encontrado');
        }
        
        // Event listeners
         if (registerBtn) {
             registerBtn.addEventListener('click', function() {
                 console.log('🔘 Botón de registro clickeado');
                 if (registerModal) {
                     registerModal.show();
                     console.log('✅ Modal de registro mostrado');
                 } else {
                     console.error('❌ Modal de registro no disponible');
                 }
             });
             console.log('✅ Event listener agregado al botón de registro');
         } else {
             console.error('❌ Botón de registro no encontrado');
         }
         
         if (forgotPasswordBtn) {
             forgotPasswordBtn.addEventListener('click', function() {
                 console.log('🔘 Botón de recuperación clickeado');
                 if (forgotPasswordModal) {
                     forgotPasswordModal.show();
                     console.log('✅ Modal de recuperación mostrado');
                 } else {
                     console.error('❌ Modal de recuperación no disponible');
                 }
             });
             console.log('✅ Event listener agregado al botón de recuperación');
         } else {
             console.error('❌ Botón de recuperación no encontrado');
         }
         
         // Crear cuenta
         if (createAccountBtn) {
             createAccountBtn.addEventListener('click', function() {
                 console.log('🔘 Botón crear cuenta clickeado');
                 
                 const email = document.getElementById('registerEmail').value;
                 const password = document.getElementById('registerPassword').value;
                 const confirmPassword = document.getElementById('confirmPassword').value;
                 
                 console.log('Datos de registro:', { email, password: '***', confirmPassword: '***' });
                 
                 if (!email || !password || !confirmPassword) {
                     console.error('❌ Campos de registro vacíos');
                     showAlert('Por favor complete todos los campos', 'danger', 'registerModal');
                     return;
                 }
                 
                 if (!isValidEmail(email)) {
                     console.error('❌ Formato de email inválido');
                     showAlert('Por favor ingrese un correo electrónico válido', 'danger', 'registerModal');
                     return;
                 }
                 
                 if (password !== confirmPassword) {
                     console.error('❌ Contraseñas no coinciden');
                     showAlert('Las contraseñas no coinciden', 'danger', 'registerModal');
                     return;
                 }
                 
                 if (password.length < 8) {
                     console.error('❌ Contraseña muy corta');
                     showAlert('La contraseña debe tener al menos 8 caracteres', 'danger', 'registerModal');
                     return;
                 }
                 
                 if (typeof firebase !== 'undefined') {
                     console.log('🔄 Creando cuenta con Firebase...');
                     
                     createAccountBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';
                     createAccountBtn.disabled = true;
                     
                     firebase.auth().createUserWithEmailAndPassword(email, password)
                         .then(function(userCredential) {
                             console.log('✅ Cuenta creada exitosamente:', userCredential.user.email);
                             console.log('✅ UID del usuario:', userCredential.user.uid);
                             
                             // Enviar email de verificación
                             return userCredential.user.sendEmailVerification()
                                 .then(function() {
                                     console.log('✅ Email de verificación enviado');
                                     
                                     // Cerrar modal y mostrar éxito
                                     if (registerModal) {
                                         registerModal.hide();
                                     }
                                     showAlert('Cuenta creada exitosamente. Se ha enviado un email de verificación a su correo electrónico. Por favor verifique su email antes de iniciar sesión.', 'success');
                                     
                                     // Resetear formulario
                                     createAccountBtn.innerHTML = 'Crear Cuenta';
                                     createAccountBtn.disabled = false;
                                     const form = document.getElementById('registerForm');
                                     if (form) {
                                         form.reset();
                                     }
                                     
                                     // Cerrar sesión automáticamente para que el usuario verifique su email
                                     firebase.auth().signOut();
                                 })
                                 .catch(function(emailError) {
                                     console.error('❌ Error enviando email de verificación:', emailError);
                                     
                                     // Cerrar modal y mostrar mensaje parcial de éxito
                                     if (registerModal) {
                                         registerModal.hide();
                                     }
                                     showAlert('Cuenta creada exitosamente, pero hubo un error enviando el email de verificación. Puede solicitar un nuevo email desde su perfil.', 'warning');
                                     
                                     // Resetear formulario
                                     createAccountBtn.innerHTML = 'Crear Cuenta';
                                     createAccountBtn.disabled = false;
                                     const form = document.getElementById('registerForm');
                                     if (form) {
                                         form.reset();
                                     }
                                     
                                     // Cerrar sesión automáticamente
                                     firebase.auth().signOut();
                                 });
                         })
                         .catch(function(error) {
                             console.error('❌ Error creando cuenta:', error);
                             createAccountBtn.innerHTML = 'Crear Cuenta';
                             createAccountBtn.disabled = false;
                             
                             let errorMessage = 'Error al crear la cuenta. Intente nuevamente.';
                             
                             if (error.code === 'auth/email-already-in-use') {
                                 errorMessage = 'Este correo electrónico ya está en uso.';
                             } else if (error.code === 'auth/invalid-email') {
                                 errorMessage = 'Correo electrónico inválido.';
                             } else if (error.code === 'auth/weak-password') {
                                 errorMessage = 'La contraseña es muy débil.';
                             }
                             
                             showAlert(errorMessage, 'danger', 'registerModal');
                         });
                 } else {
                     console.error('❌ Firebase no disponible para registro');
                     showAlert('Error: Firebase no está disponible', 'danger', 'registerModal');
                 }
             });
             console.log('✅ Event listener agregado al botón crear cuenta');
         } else {
             console.error('❌ Botón crear cuenta no encontrado');
         }
         
         // Recuperar contraseña
         if (resetPasswordBtn) {
             resetPasswordBtn.addEventListener('click', function() {
                 console.log('🔘 Botón reset password clickeado');
                 
                 const email = document.getElementById('resetEmail').value;
                 
                 console.log('Email para reset:', email);
                 
                 if (!email) {
                     console.error('❌ Email para reset vacío');
                     showAlert('Por favor ingrese su correo electrónico', 'danger', 'forgotPasswordModal');
                     return;
                 }
                 
                 if (!isValidEmail(email)) {
                     console.error('❌ Formato de email inválido en reset');
                     showAlert('Por favor ingrese un correo electrónico válido', 'danger', 'forgotPasswordModal');
                     return;
                 }
                 
                 if (typeof firebase !== 'undefined') {
                     console.log('🔄 Enviando email de reset...');
                     
                     resetPasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
                     resetPasswordBtn.disabled = true;
                     
                     firebase.auth().sendPasswordResetEmail(email)
                         .then(function() {
                             console.log('✅ Email de reset enviado');
                             
                             forgotPasswordModal.hide();
                             showAlert('Se ha enviado un enlace de recuperación a su correo electrónico', 'success');
                             resetPasswordBtn.innerHTML = 'Enviar Enlace';
                             resetPasswordBtn.disabled = false;
                             document.getElementById('forgotPasswordForm').reset();
                         })
                         .catch(function(error) {
                             console.error('❌ Error enviando email de reset:', error);
                             resetPasswordBtn.innerHTML = 'Enviar Enlace';
                             resetPasswordBtn.disabled = false;
                             
                             let errorMessage = 'Error al enviar el enlace. Intente nuevamente.';
                             
                             if (error.code === 'auth/user-not-found') {
                                 errorMessage = 'No existe una cuenta con este correo electrónico.';
                             } else if (error.code === 'auth/invalid-email') {
                                 errorMessage = 'Correo electrónico inválido.';
                             }
                             
                             showAlert(errorMessage, 'danger', 'forgotPasswordModal');
                         });
                 } else {
                     console.error('❌ Firebase no disponible para reset');
                     showAlert('Error: Firebase no está disponible', 'danger', 'forgotPasswordModal');
                 }
             });
             console.log('✅ Event listener agregado al botón reset password');
         } else {
             console.error('❌ Botón reset password no encontrado');
         }
        
        // Login form
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log('🔘 Formulario de login enviado');
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                console.log('Datos del formulario:', { username, password: '***' });
                
                if (!username || !password) {
                    console.error('❌ Campos vacíos');
                    showAlert('Por favor complete todos los campos', 'danger');
                    return;
                }
                
                if (!isValidEmail(username)) {
                    console.error('❌ Formato de email inválido en login');
                    showAlert('Por favor ingrese un correo electrónico válido', 'danger');
                    return;
                }
                
                if (typeof firebase !== 'undefined') {
                    console.log('🔄 Intentando login con Firebase...');
                    
                    const submitBtn = loginForm.querySelector('button[type="submit"]');
                    const originalBtnText = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
                    submitBtn.disabled = true;
                    
                    firebase.auth().signInWithEmailAndPassword(username, password)
                        .then(function(userCredential) {
                            console.log('✅ Login exitoso:', userCredential.user.email);
                            
                            // Verificar si el email está verificado
                            if (!userCredential.user.emailVerified) {
                                console.log('❌ Email no verificado');
                                
                                // Cerrar sesión automáticamente
                                firebase.auth().signOut();
                                
                                // Mostrar mensaje con opción de reenviar email
                                showAlert('Debe verificar su correo electrónico antes de acceder. Revise su bandeja de entrada y haga clic en el enlace de verificación. <br><br><button class="btn btn-sm btn-primary mt-2" onclick="resendVerificationEmail(\'' + userCredential.user.email + '\', \'' + password + '\')" id="resendEmailBtn">Reenviar email de verificación</button>', 'warning');
                                
                                submitBtn.innerHTML = originalBtnText;
                                submitBtn.disabled = false;
                                return;
                            }
                            
                            // Si el email está verificado, proceder al dashboard
                            window.location.href = 'dashboard.html';
                        })
                        .catch(function(error) {
                            console.error('❌ Error en login:', error);
                            submitBtn.innerHTML = originalBtnText;
                            submitBtn.disabled = false;
                            
                            let errorMessage = 'Error al iniciar sesión. Intente nuevamente.';
                            
                            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                                errorMessage = 'Usuario o contraseña incorrectos.';
                            } else if (error.code === 'auth/too-many-requests') {
                                errorMessage = 'Demasiados intentos fallidos. Intente más tarde.';
                            }
                            
                            showAlert(errorMessage, 'danger');
                        });
                } else {
                    console.error('❌ Firebase no disponible para login');
                    showAlert('Error: Firebase no está disponible', 'danger');
                }
            });
            console.log('✅ Event listener agregado al formulario de login');
        } else {
            console.error('❌ Formulario de login no encontrado');
        }
        
    } else {
        console.error('❌ Bootstrap no está disponible');
    }
    
    // Funcionalidad para mostrar/ocultar contraseñas
    function setupPasswordToggle(toggleButtonId, passwordInputId, iconId) {
        const toggleButton = document.getElementById(toggleButtonId);
        const passwordInput = document.getElementById(passwordInputId);
        const icon = document.getElementById(iconId);
        
        if (toggleButton && passwordInput && icon) {
            toggleButton.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Cambiar el ícono
                if (type === 'text') {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
            console.log(`✅ Toggle de contraseña configurado para ${passwordInputId}`);
        } else {
            console.error(`❌ No se pudo configurar toggle para ${passwordInputId}`);
        }
    }
    
    // Configurar toggles para todos los campos de contraseña
    setupPasswordToggle('togglePassword', 'password', 'togglePasswordIcon');
    setupPasswordToggle('toggleRegisterPassword', 'registerPassword', 'toggleRegisterPasswordIcon');
    setupPasswordToggle('toggleConfirmPassword', 'confirmPassword', 'toggleConfirmPasswordIcon');
    
    console.log('=== INICIALIZACIÓN COMPLETADA ===');
});

// Función para mostrar alertas
function showAlert(message, type, modalId) {
    console.log('📢 Mostrando alerta:', { message, type, modalId });
    
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-' + type + ' alert-dismissible fade show';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
    
    let container;
    if (modalId) {
        container = document.querySelector('#' + modalId + ' .modal-body');
        if (container) {
            container.prepend(alertDiv);
        } else {
            console.error('❌ Contenedor del modal no encontrado:', modalId);
        }
    } else {
        container = document.querySelector('.login-header');
        if (container) {
            container.after(alertDiv);
        } else {
            console.error('❌ Contenedor de login-header no encontrado');
            // Fallback: agregar al body
            document.body.prepend(alertDiv);
        }
    }
    
    setTimeout(function() {
        alertDiv.classList.remove('show');
        setTimeout(function() {
            alertDiv.remove();
        }, 300);
    }, 5000);
}

// Función para reenviar email de verificación
function resendVerificationEmail(email, password) {
    console.log('🔄 Reenviando email de verificación para:', email);
    
    const resendBtn = document.getElementById('resendEmailBtn');
    if (resendBtn) {
        resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        resendBtn.disabled = true;
    }
    
    // Iniciar sesión temporalmente para enviar el email
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            return userCredential.user.sendEmailVerification();
        })
        .then(function() {
            console.log('✅ Email de verificación reenviado');
            
            // Cerrar sesión nuevamente
            firebase.auth().signOut();
            
            showAlert('Email de verificación reenviado exitosamente. Revise su bandeja de entrada.', 'success');
        })
        .catch(function(error) {
            console.error('❌ Error reenviando email:', error);
            
            let errorMessage = 'Error al reenviar el email de verificación.';
            if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Demasiados intentos. Espere unos minutos antes de intentar nuevamente.';
            }
            
            showAlert(errorMessage, 'danger');
            
            if (resendBtn) {
                resendBtn.innerHTML = 'Reenviar email de verificación';
                resendBtn.disabled = false;
            }
        });
}

console.log('=== LOGIN.JS COMPLETAMENTE CARGADO ===');