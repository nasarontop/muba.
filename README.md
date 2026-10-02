# MobiTPV – Sistema TPV para Tiendas de Móviles y SAT

## Estructura del proyecto

```
tpv-moviles/
├── index.html              ← Landing Page
├── auth/
│   └── login.html          ← Login / Registro
├── dashboard/
│   └── index.html          ← Panel de control completo
├── assets/img/             ← Imágenes estáticas
└── backend/
    ├── server.js           ← API REST (Express + LowDB)
    ├── package.json
    └── db.json             ← Base de datos JSON (se crea al iniciar)
```

## Uso sin backend (modo estático)

Abre directamente en el navegador:

```
tpv-moviles/index.html
```

Desde la landing → "Iniciar Sesión" → usa las credenciales demo:
- Email: `admin@mobitpv.es`
- Contraseña: `demo1234`

> Todos los datos son locales (mock en memoria). Funciona sin Node.js.

---

## Uso con backend (API REST persistente)

### Requisitos
- Node.js ≥ 18

### Instalar y arrancar

```bash
cd backend
npm install
npm start
```

El servidor arranca en `http://localhost:3001`

- 🏠 Landing    → http://localhost:3001/index.html
- 🔐 Login      → http://localhost:3001/auth/login.html
- 📊 Dashboard  → http://localhost:3001/dashboard/index.html
- ❤️  API        → http://localhost:3001/api/health

### Credenciales demo
| Email | Contraseña |
|-------|-----------|
| admin@mobitpv.es | demo1234 |

---

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Iniciar sesión → devuelve JWT |
| POST | /api/auth/register | Crear cuenta |
| GET | /api/auth/me | Info del usuario (requiere JWT) |
| GET | /api/products | Listar productos |
| POST | /api/products | Crear producto |
| PUT | /api/products/:id | Actualizar producto |
| DELETE | /api/products/:id | Eliminar producto |
| GET | /api/sales | Listar ventas |
| POST | /api/sales | Crear venta (descuenta stock) |
| GET | /api/sat | Listar fichas SAT |
| POST | /api/sat | Crear ficha SAT |
| PUT | /api/sat/:id | Actualizar estado SAT |
| GET | /api/clients | Listar clientes |
| POST | /api/clients | Crear cliente |
| GET | /api/dashboard/metrics | Métricas del día |

Todos los endpoints protegidos requieren header:
```
Authorization: Bearer <token>
```

---

## Tecnologías
- **Frontend**: HTML5 + Tailwind CSS (CDN) + JavaScript vanilla
- **Backend**: Node.js + Express + LowDB (JSON file, sin BD externa)
- **Auth**: JWT (jsonwebtoken) + bcryptjs
