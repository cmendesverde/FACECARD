# FACECARD

Plataforma de talento (agencia / marketplace de perfiles) con dos modos de acceso:

- **Login tradicional** — email + contraseña contra la API Laravel (Sanctum).
- **Flujo facial en cliente** — reconocimiento facial que corre **en el navegador** con
  **BlazeFace + face-api.js** (TensorFlow.js). Detecta el rostro, evalúa liveness y
  dispara el acceso. En el build actual este flujo funciona como **demo simulado**
  (escaneo autoejecutable, sin verificación biométrica real).

> **Privacidad — la biometría no sale del navegador.** El procesamiento facial
> (detección, descriptores, liveness) se ejecuta íntegramente en el cliente con
> TensorFlow.js. **No se envían imágenes ni descriptores biométricos crudos al
> servidor**: al backend solo llegan señales del resultado del escaneo (email,
> flags de scan/liveness aprobados y puntuaciones), nunca el rostro del usuario.

## URLs públicas

| Entorno | URL |
|---|---|
| Frontend (Vercel) | https://facecard.vercel.app |
| API (Render) | https://api-facecard.onrender.com |

> Valores leídos de `backend/.env.example` (`FRONTEND_URL`, `APP_URL`). El servicio
> de Render se define en `render.yaml` como `facecard-api`.

## Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS
- Framer Motion
- TensorFlow.js (BlazeFace + face-api.js) para el acceso facial en cliente

**Backend**
- Laravel 12
- Laravel Sanctum (autenticación)
- MySQL
- Docker (imagen de despliegue en Render)

## Arranque local

### Requisitos
- PHP 8.2+ y Composer
- Node.js 20+
- MySQL en ejecución (p. ej. XAMPP)

### Backend (Laravel — API en `http://127.0.0.1:8000`)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Crea la base de datos `facecard` en MySQL y ajusta credenciales en .env
php artisan migrate --seed
php artisan serve
```

Variables de entorno relevantes (`backend/.env`, ver `.env.example`):

| Variable | Descripción |
|---|---|
| `APP_KEY` | Se genera con `php artisan key:generate` |
| `APP_URL` | URL de la API |
| `FRONTEND_URL` | URL del frontend (para CORS / Sanctum) |
| `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` | Conexión MySQL (por defecto `facecard` / `root` / vacío) |
| `SANCTUM_STATEFUL_DOMAINS` | Dominios que reciben cookie de sesión |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos |

Usuario admin de demo tras `--seed`: `admin@facecard.local` / `password`.

### Frontend (React + Vite — `http://localhost:5173`)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Variables de entorno (`frontend/.env`, ver `.env.example`):

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | Base de la API (local: `http://127.0.0.1:8000/api`) |
| `VITE_DEMO_EMAIL` | (opcional) Email precargado en el login demo |
| `VITE_DEMO_PASSWORD` | (opcional) Contraseña precargada en el login demo |
