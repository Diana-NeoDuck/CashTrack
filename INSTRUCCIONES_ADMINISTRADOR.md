# 🚨 INSTRUCCIONES URGENTES PARA EL ADMINISTRADOR

## PROBLEMA ACTUAL
La aplicación CashTrack no puede crear cuentas de usuario porque **Firebase Authentication NO está habilitado**.

### Error Específico:
```
FirebaseError: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## ✅ ACCIONES REQUERIDAS DEL ADMINISTRADOR

### 1. ACCEDER A FIREBASE CONSOLE
- URL: https://console.firebase.google.com/
- Proyecto: `cashtrack-864b9`
- **REQUIERE:** Gmail con permisos de administrador del proyecto

### 2. HABILITAR FIREBASE AUTHENTICATION (CRÍTICO)
```
📍 Pasos exactos EN ESPAÑOL:
1. En Firebase Console → Seleccionar proyecto "cashtrack-864b9"
2. Menú lateral → "Compilación" o "Crear" → "Authentication" o "Autenticación"
3. Si aparece "Comenzar" o "Empezar" → HACER CLIC
4. Pestaña "Método de acceso" o "Sign-in method"
5. Buscar "Correo electrónico/Contraseña" o "Email/Password" → HACER CLIC
6. Toggle "Habilitar" o "Enable" → ACTIVAR
7. Botón "Guardar" o "Save" → HACER CLIC
```

### 🔍 **SI NO ENCUENTRAS LAS OPCIONES:**
- Busca "Autenticación" en lugar de "Authentication"
- Busca "Compilación" o "Crear" en lugar de "Build"
- Busca "Correo electrónico/Contraseña" en lugar de "Email/Password"
- El botón puede decir "Comenzar" en lugar de "Get started"

### 3. HABILITAR APIs EN GOOGLE CLOUD
- URL: https://console.cloud.google.com/
- Proyecto: `cashtrack-864b9`

```
📍 APIs a habilitar (EN ESPAÑOL):
1. "APIs y servicios" o "APIs & Services" → "Biblioteca" o "Library"
2. Buscar y HABILITAR:
   ✓ Identity Toolkit API
   ✓ Firebase Authentication API
   ✓ Firebase Realtime Database API
```

### 4. CONFIGURAR PERMISOS DE API KEY
```
📍 En Google Cloud Console (EN ESPAÑOL):
1. "APIs y servicios" o "APIs & Services" → "Credenciales" o "Credentials"
2. Buscar API key: AIzaSyBvOiEM292yIXxWQLNyYlIK3W3MdQyO8Ws
3. Hacer clic para editar
4. "Restricciones de API" o "API restrictions" → "Restringir clave" o "Restrict key"
5. Seleccionar:
   ✓ Identity Toolkit API
   ✓ Firebase Authentication API
6. Guardar cambios
```

## 🧪 VERIFICACIÓN

Después de completar los pasos, ejecutar en terminal:
```bash
curl -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBvOiEM292yIXxWQLNyYlIK3W3MdQyO8Ws" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","returnSecureToken":true}'
```

**Resultado esperado:** Respuesta JSON con datos del usuario (no error 400)

## 📧 CONTACTO
Si no tienes acceso de administrador al proyecto Firebase:
1. Contactar al propietario original del proyecto
2. Solicitar permisos de "Editor" o "Owner"
3. O crear un nuevo proyecto Firebase siguiendo `FIREBASE_SETUP.md`

## ⏰ TIEMPO ESTIMADO
- Con acceso de admin: 5-10 minutos
- Sin acceso: Requiere coordinación con propietario

---
**ESTADO ACTUAL:** Código correcto ✅ | Firebase Authentication deshabilitado ❌