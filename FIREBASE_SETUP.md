# Configuración de Firebase para CashTrack

## ⚠️ Configuración Requerida

Para que CashTrack funcione correctamente, necesitas configurar Firebase con tu propio proyecto. Sigue estos pasos:

## 1. Crear un Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Haz clic en "Crear un proyecto" o "Add project"
3. Nombra tu proyecto (ej: "cashtrack-mi-negocio")
4. Sigue los pasos de configuración

## 2. Habilitar Authentication

1. En tu proyecto Firebase, ve a **Authentication**
2. Haz clic en **Get started**
3. Ve a la pestaña **Sign-in method**
4. Habilita **Email/Password**

## 3. Configurar Realtime Database

1. Ve a **Realtime Database**
2. Haz clic en **Create Database**
3. Selecciona una ubicación (ej: us-central1)
4. Comienza en **modo de prueba** (puedes cambiar las reglas después)

## 4. Obtener la Configuración

1. Ve a **Project Settings** (ícono de engranaje)
2. Baja hasta **Your apps**
3. Haz clic en **Add app** y selecciona **Web** (</>) 
4. Registra tu app con un nombre
5. Copia la configuración que aparece

## 5. Actualizar firebase-config.js

Reemplaza el contenido de `js/firebase-config.js` con tu configuración:

```javascript
// Firebase configuration
const firebaseConfig = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
  
  // Verificar que los servicios estén disponibles
  if (firebase.auth) {
    console.log('✅ Firebase Auth disponible');
  } else {
    console.error('❌ Firebase Auth no disponible');
  }
  
  if (firebase.database) {
    console.log('✅ Firebase Database disponible');
  } else {
    console.error('❌ Firebase Database no disponible');
  }
  
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error);
}
```

## 6. Configurar Reglas de Seguridad (Opcional)

Puedes usar las reglas en `firebase-security-rules.json` para configurar la seguridad de tu base de datos.

## 🚀 ¡Listo!

Una vez completada la configuración, tu aplicación CashTrack estará lista para:
- Registrar nuevos usuarios
- Autenticar usuarios existentes
- Guardar datos de ventas y gastos
- Recuperar contraseñas

## 🔧 Solución de Problemas

- **Error de API Key**: Verifica que hayas copiado correctamente la configuración
- **Error de dominio**: Asegúrate de que el authDomain sea correcto
- **Error de permisos**: Revisa las reglas de la base de datos

## 📞 Soporte

Si tienes problemas, revisa:
1. La consola del navegador (F12) para errores específicos
2. La consola de Firebase para logs del proyecto
3. Que todos los servicios estén habilitados correctamente