# FACECARD

Plataforma de talento (agencia / marketplace de perfiles) con dos modos de acceso:

- **Login tradicional** — email + contraseña contra la API Laravel (Sanctum).
- **Flujo facial en cliente** — reconocimiento facial que corre **en el navegador**
  con **face-api.js** (`tinyFaceDetector` + `faceLandmark68TinyNet` +
  `faceRecognitionNet`) sobre **TensorFlow.js**. Detecta el rostro, evalúa liveness
  y dispara el acceso. En el build actual este flujo funciona como **demo simulado**
  (escaneo autoejecutable, sin verificación biométrica real).

> **⚠️ Demo pública.** La instancia desplegada es una **demo con datos ficticios**
> (talentos, reservas y usuarios inventados). Con el modo demo activo
> (`FACECARD_DEMO_MODE=true`), el acceso facial **concede sesión de administrador
> por diseño**, sin verificación biométrica real: es intencional para exhibir el
> panel interno, no un fallo de seguridad. No introduzcas datos personales reales.

> **Privacidad y datos biométricos.** La detección del rostro, el cálculo del
> descriptor y la prueba de vida (liveness) se ejecutan **en el navegador** con
> TensorFlow.js y face-api.js. **La imagen del rostro (los frames de la cámara)
> nunca sale del cliente.** Ahora bien, el flujo de verificación **sí envía y
> persiste un descriptor facial** —un vector de 128 números en coma flotante
> derivado del rostro— en la tabla `biometric_profiles` (columna `face_descriptor`),
> que el backend usa para comparar por distancia euclídea al iniciar sesión.
>
> Un descriptor facial **es un dato biométrico**: categoría especial de datos
> personales bajo el RGPD (art. 9). En este repositorio el descriptor se almacena
> **cifrado en reposo** (cast `encrypted` de Laravel). Para un despliegue real, el
> cifrado no basta: harían falta como mínimo **consentimiento explícito** antes de
> generar o guardar el descriptor, una **política de retención** con borrado, y que
> el usuario pueda **eliminar su descriptor** cuando quiera —expuesto aquí en
> `DELETE /api/me/biometric-profile`.

## URLs públicas

| Entorno | URL |
|---|---|
| Frontend (Vercel) | https://facecard-iota.vercel.app |
| API (Render) | _pendiente de desplegar_ |

<!-- TODO: fijar la URL de la API cuando el backend esté desplegado en Render. -->

## Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS
- Framer Motion
- TensorFlow.js + face-api.js (`tinyFaceDetector`) para el acceso facial en cliente

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
| `FACECARD_DEMO_MODE` | `true` habilita el login facial demo (simulado, sin biometría real) en cualquier entorno, incluido producción. Por defecto `false`. |

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
