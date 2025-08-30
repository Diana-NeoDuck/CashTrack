# Firebase Troubleshooting Guide - ACTUALIZADO

Este error indica que Firebase Authentication NO está habilitado en tu proyecto.

## Error Actual
```
POST https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBvOiEM292yIXxWQLNyYlIK3W3MdQyO8Ws 400 (Bad Request)
FirebaseError: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## SOLUCIÓN URGENTE REQUERIDA

### ⚠️ PROBLEMA CONFIRMADO
La API key `AIzaSyBvOiEM292yIXxWQLNyYlIK3W3MdQyO8Ws` es **INVÁLIDA** porque:
- Firebase Authentication NO está habilitado en el proyecto
- El proyecto necesita configuración del administrador

### 🔧 PASOS OBLIGATORIOS

#### 1. HABILITAR FIREBASE AUTHENTICATION (CRÍTICO)
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto: `cashtrack-864b9`
3. En el menú izquierdo, busca "Authentication"
4. **SI NO VES "Authentication" en el menú:**
   - Haz clic en "Build" para expandir el menú
   - Busca "Authentication"
5. **Haz clic en "Get started"** (si aparece)
6. Ve a la pestaña "Sign-in method"
7. **HABILITA Email/Password:**
   - Haz clic en "Email/Password"
   - Activa el toggle "Enable"
   - Haz clic en "Save"

#### 2. VERIFICAR APIS HABILITADAS
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto: `cashtrack-864b9`
3. Ve a "APIs & Services" > "Library"
4. **Busca y HABILITA estas APIs:**
   - Identity Toolkit API
   - Firebase Authentication API
   - Firebase Realtime Database API

#### 3. CONFIGURAR PERMISOS DE API KEY
1. En Google Cloud Console
2. Ve a "APIs & Services" > "Credentials"
3. Busca tu API key: `AIzaSyBvOiEM292yIXxWQLNyYlIK3W3MdQyO8Ws`
4. Haz clic para editarla
5. En "API restrictions":
   - Selecciona "Restrict key"
   - Habilita: Identity Toolkit API, Firebase Authentication API

## Pasos de Diagnóstico

### Paso 1: Verificar Estado del Proyecto
1. Ve a Firebase Console
2. Confirma que puedes ver el proyecto `cashtrack-864b9`
3. Verifica que Authentication aparezca en el menú lateral

### Paso 2: Probar API Key Manualmente
Ejecuta este comando en terminal para probar la API key:

```bash
curl 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBvOiEM292yIXxWQLNyYlIK3W3MdQyO8Ws' \
-H 'Content-Type: application/json' \
--data-binary '{"email":"test@example.com","password":"testpass123","returnSecureToken":true}'
```

**Respuestas esperadas:**
- ✅ **200 OK**: API key válida, Authentication habilitado
- ❌ **400 Bad Request**: API key inválida o Authentication no habilitado
- ❌ **403 Forbidden**: Restricciones de API key

### Paso 3: Verificar APIs Habilitadas
1. Ve a Google Cloud Console
2. "APIs & Services" > "Enabled APIs"
3. Busca y confirma que estén habilitadas:
   - Identity Toolkit API
   - Firebase Authentication API

## Solución Rápida

Si el problema persiste, la solución más directa es:

1. **Crear una nueva app web en Firebase:**
   - Firebase Console > Project Settings > "Add app" > Web
   - Registra la app con nombre "CashTrack Web"
   - Copia la nueva configuración

2. **Habilitar Authentication:**
   - Authentication > "Get started"
   - Sign-in method > Email/Password > Enable

3. **Actualizar configuración:**
   - Reemplaza todo el contenido de `firebase-config.js` con la nueva config

## Contacto de Soporte

Si ninguna solución funciona:
1. Documenta todos los pasos realizados
2. Incluye screenshots del error
3. Contacta Firebase Support con el Project ID: `cashtrack-864b9`

---

**Nota:** Este error es común cuando se intenta usar Firebase Authentication sin haberlo habilitado primero en la consola.