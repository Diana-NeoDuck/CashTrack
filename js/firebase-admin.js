// Firebase Admin SDK configuration
const admin = require("firebase-admin");

// Nota: En producción, este archivo debe estar en el servidor y no en el cliente
// Para desarrollo local, puedes usar una ruta relativa al archivo de credenciales
// En Vercel, deberás configurar las variables de entorno para las credenciales

// Ruta al archivo de credenciales de servicio (debes descargar este archivo desde la consola de Firebase)
// Para producción, usa variables de entorno en lugar de archivos
try {
  const serviceAccount = require("../serviceAccountKey.json");
  
  // Inicializar la aplicación de Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cashtrack-864b9-default-rtdb.firebaseio.com"
  });
  
  console.log("Firebase Admin SDK inicializado correctamente");
} catch (error) {
  console.error("Error al inicializar Firebase Admin SDK:", error);
}

// Exportar la instancia de admin para usarla en otros archivos
module.exports = admin;