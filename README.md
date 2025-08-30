# CashTrack - Sistema de Gestión de Caja

CashTrack es una aplicación web moderna para la gestión de caja de pequeños negocios, desarrollada con tecnologías web estándar y Firebase como backend.

## Características

- 🔐 **Autenticación segura** con Firebase Auth
- 💰 **Gestión de ventas** con seguimiento detallado
- 📊 **Control de gastos** por categorías
- 👥 **Gestión de clientes** con historial de compras
- 📦 **Control de inventario** con alertas de stock
- 📈 **Reportes y análisis** en tiempo real
- 🎨 **Diseño moderno** con colores corporativos
- 📱 **Responsive** para dispositivos móviles

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Realtime Database
- **Autenticación**: Firebase Auth
- **Hosting**: Vercel
- **Estilos**: Bootstrap 5 + CSS personalizado

## Estructura del Proyecto

```
CashTrack/
├── index.html              # Página principal
├── login.html              # Página de login/registro
├── dashboard.html          # Panel de control principal
├── css/
│   ├── styles.css         # Estilos principales
│   └── login.css          # Estilos del login
├── js/
│   ├── dashboard.js       # Lógica del dashboard
│   ├── login.js          # Lógica de autenticación
│   └── firebase-config.js # Configuración de Firebase
├── firebase-database-structure.json  # Estructura de la BD
├── firebase-security-rules.json      # Reglas de seguridad
├── vercel.json            # Configuración de Vercel
└── README.md              # Este archivo
```

## Configuración de Firebase

### 1. Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Firebase Auth y Realtime Database

### 2. Configurar Authentication

1. En Firebase Console, ve a Authentication > Sign-in method
2. Habilita "Email/Password"
3. Configura dominios autorizados si es necesario

### 3. Configurar Realtime Database

1. En Firebase Console, ve a Realtime Database
2. Crea una base de datos en modo de prueba
3. Importa las reglas de seguridad desde `firebase-security-rules.json`
4. Opcionalmente, importa la estructura desde `firebase-database-structure.json`

### 4. Obtener configuración

1. Ve a Project Settings > General
2. En "Your apps", agrega una app web
3. Copia la configuración de Firebase
4. Actualiza `js/firebase-config.js` con tus credenciales

```javascript
// js/firebase-config.js
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com/",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};
```

## Despliegue en Vercel

### 1. Preparar el proyecto

```bash
# Clonar o descargar el proyecto
git clone <tu-repositorio>
cd CashTrack
```

### 2. Configurar variables de entorno en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Importa tu proyecto desde GitHub
3. En Settings > Environment Variables, agrega:

```
FIREBASE_API_KEY=tu-api-key
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_DATABASE_URL=https://tu-proyecto-default-rtdb.firebaseio.com/
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=tu-app-id
```

### 3. Desplegar

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Desplegar
vercel --prod
```

## Estructura de la Base de Datos

La aplicación utiliza la siguiente estructura en Firebase Realtime Database:

```
users/
  {userId}/
    profile/          # Información del usuario
    settings/         # Configuraciones
    initialCash/      # Caja inicial
    sales/           # Ventas realizadas
    expenses/        # Gastos registrados
    customers/       # Clientes
    inventory/       # Productos en inventario
    inventoryAdjustments/  # Ajustes de stock
    dailyClosures/   # Cierres diarios
```

## Funcionalidades Principales

### Gestión de Ventas
- Registro de ventas con múltiples productos
- Soporte para diferentes métodos de pago
- Gestión de clientes
- Impresión de facturas
- Estados de venta (completada, pendiente, cancelada)

### Control de Gastos
- Categorización de gastos
- Registro de proveedores
- Adjuntar recibos
- Diferentes métodos de pago

### Inventario
- Gestión de productos
- Control de stock con alertas
- Ajustes de inventario
- Códigos SKU y códigos de barras
- Precios de costo y venta

### Reportes
- Resumen diario de ventas y gastos
- Análisis por período
- Reportes de inventario
- Cierre de caja diario

## Seguridad

- Autenticación requerida para todas las operaciones
- Reglas de seguridad de Firebase que protegen los datos por usuario
- Validación de datos en el frontend y backend
- Headers de seguridad configurados en Vercel

## Desarrollo Local

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd CashTrack

# Servir archivos estáticos (Python)
python3 -m http.server 8000

# O usar cualquier servidor web local
# Abrir http://localhost:8000
```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o preguntas, contacta a [tu-email@ejemplo.com]

---

**CashTrack** - Desarrollado con ❤️ para pequeños negocios