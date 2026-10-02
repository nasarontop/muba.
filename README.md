# 🏪 MobiTPV – Sistema TPV para Tiendas de Móviles

**Sistema completo de punto de venta especializado en tiendas de móviles y servicios técnicos (SAT)**

## ✨ Características Principales

- **TPV Completo**: Ventas con gestión de IMEIs, códigos de barras y stock automático
- **Módulo SAT**: Fichas técnicas, seguimiento de reparaciones y estados
- **Gestión de Inventario**: Control de stock, alertas de stock bajo, categorías
- **Clientes**: Base de datos completa con historial de compras y reparaciones
- **Dashboard Inteligente**: Métricas en tiempo real, ventas del día, estado SAT
- **Multi-modal**: Funciona con backend real o datos mock locales

## 🚀 Iniciar el Sistema

### Opción 1: Sistema Completo (Recomendado)
```bash
# Doble-click en:
start-full.bat
```
Esto iniciará:
- ✅ Backend en `http://localhost:3001`
- ✅ Frontend en tu navegador
- ✅ Datos persistentes en `backend/db.json`

### Opción 2: Solo Frontend (Sin persistencia)
```bash
# Doble-click en:
index.html
```
Usa datos mock en localStorage.

### Opción 3: Solo Backend
```bash
# Doble-click en:
start-backend.bat
```

## 🔐 Credenciales Demo

```
Email:    admin@mobitpv.es
Password: demo1234
```

## 📁 Estructura del Proyecto

```
muba/
├── index.html              # Landing page
├── auth/login.html         # Autenticación
├── dashboard/index.html    # Panel principal
├── js/api.js              # Cliente API con fallback mock
├── config.js              # Configuración local
├── backend/
│   ├── server.js          # API REST Node.js + Express
│   ├── db.json           # Base de datos LowDB
│   ├── package.json      # Dependencias
│   └── .env.example      # Variables de entorno
├── start-full.bat        # Iniciar sistema completo
├── start-backend.bat     # Solo backend
└── README.md            # Esta documentación
```

## 🔧 Instalación Desarrollo

```bash
# 1. Instalar dependencias del backend
cd backend
npm install

# 2. Iniciar backend
npm start

# 3. Abrir frontend
# Doble-click en index.html
```

## 🌐 Despliegue

### Frontend (GitHub Pages)
1. Push a GitHub
2. Settings → Pages → Deploy from main branch
3. Tu web estará en: `https://usuario.github.io/repo`

### Backend (Render/Railway)
- ✅ Configurado con `railway.json`, `Procfile`, `nixpacks.toml`
- ✅ Variables de entorno preparadas
- ✅ Health check en `/api/health`

## 📊 API Endpoints

```http
# Auth
POST /api/auth/login            # Iniciar sesión
POST /api/auth/register         # Crear cuenta
GET  /api/auth/me              # Usuario actual

# Productos
GET    /api/products           # Listar productos
POST   /api/products           # Crear producto
PUT    /api/products/:id       # Actualizar producto
DELETE /api/products/:id       # Eliminar producto

# Ventas
GET  /api/sales               # Listar ventas
POST /api/sales               # Nueva venta (descuenta stock)

# SAT
GET    /api/sat               # Listar fichas SAT
POST   /api/sat               # Nueva ficha SAT
PUT    /api/sat/:id           # Actualizar estado/campos
DELETE /api/sat/:id           # Eliminar ficha

# Clientes
GET  /api/clients             # Listar clientes
POST /api/clients             # Crear cliente
PUT  /api/clients/:id         # Actualizar cliente

# Dashboard
GET /api/dashboard/metrics    # Métricas del día

# Utilidades
GET /api/health              # Estado servidor
```

## 🎯 Casos de Uso

### Para Tiendas de Móviles
- Venta de teléfonos con registro de IMEI automático
- Gestión de stock por categorías (phones/spares/accessories)
- Control de productos reacondicionados
- Alertas de stock bajo personalizables

### Para SAT (Servicio Técnico)
- Fichas de reparación con estados (pendiente → taller → listo → entregado)
- Presupuestos y seguimiento por técnico
- Prioridades y notas técnicas
- Historial completo por cliente

### Para Gestión
- Dashboard con métricas diarias
- Análisis de ventas por periodo
- Control de clientes frecuentes
- Reportes de SAT pendiente

## 🛡️ Seguridad

- JWT para autenticación
- Validación de entrada en todas las rutas
- Encriptación de contraseñas con bcrypt
- CORS configurado para producción
- Sanitización de datos de entrada

## 📱 Tecnologías

**Frontend**
- Tailwind CSS (CDN)
- Vanilla JavaScript
- Responsive Design
- Progressive Web App ready

**Backend**
- Node.js + Express
- LowDB (JSON file database)
- JWT Authentication
- bcrypt password hashing

## 📞 Soporte

Sistema desarrollado para demostración y venta a clientes de tiendas de móviles.

**Estado**: ✅ Producción Ready  
**GitHub**: https://github.com/nasarontop/muba  
**Demo**: https://nasarontop.github.io/muba  

---
*MobiTPV © 2026 - Sistema TPV especializado para el sector móvil*
