# ⚡ INICIO RÁPIDO - Authentication Flow

## 📌 Lo que se ha implementado

### 🔐 Backend (Servidor Express en puerto 5000)
- ✅ `POST /api/auth/register` - Registrar nuevo usuario
- ✅ `POST /api/auth/login` - Iniciar sesión
- ✅ `POST /api/auth/logout` - Cerrar sesión
- ✅ Hashing de contraseñas con bcryptjs
- ✅ Validación de datos

### 🎨 Frontend (React en puerto 3000)
- ✅ `/login` - Formulario de login
- ✅ `/register` - Formulario de registro
- ✅ `/login-success` - Pantalla de bienvenida tras login exitoso
- ✅ React Router para navegación

### 🛢️ Base de Datos (PostgreSQL)
- ✅ Esquema Prisma con modelo User
- ✅ Migraciones automáticas

---

## 🚀 EJECUTAR EN 5 PASOS

### 1️⃣ PostgreSQL debe estar corriendo

**Si tienes Docker:**
```bash
docker run -d \
  --name postgres-workflows \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=workflow_db \
  -p 5432:5432 \
  postgres:latest
```

**Si PostgreSQL está instalado localmente:**
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
net start PostgreSQL-x64-13
```

### 2️⃣ Ejecutar migraciones (crear tablas)

```bash
npm run migrate:dev

# Cuando pregunte por nombre de migración, escribe:
# init

# Presiona Enter - Se crearán todas las tablas
```

### 3️⃣ Iniciar Backend y Frontend

```bash
npm run dev:all

# Verás:
# ✓ Frontend en http://localhost:3000
# ✓ Backend en http://localhost:5000
```

### 4️⃣ Registrarse

1. Ve a http://localhost:3000
2. Verás formulario de **LOGIN** por defecto
3. Click en **"Regístrate aquí"**
4. Completa datos:
   ```
   Nombre: Tu Nombre
   Email: tu@email.com
   Contraseña: Minimo6caracteres
   Confirmar: Minimo6caracteres
   Rol: Desarrollador (o lo que prefieras)
   ```
5. Click **"Registrarse"**
6. Mensaje: ✅ "¡Registro Exitoso!"
7. Automáticamente va a LOGIN

### 5️⃣ Iniciar Sesión

1. Email y contraseña que acabas de registrar
2. Click **"Iniciar Sesión"**
3. ✅ **ÉXITO**: Ves pantalla con tu perfil
   ```
   ¡Bienvenido!
   Nombre: Tu Nombre
   Correo: tu@email.com
   Rol: Desarrollador
   ```

---

## 🗂️ Archivos Nuevos Creados

```
src/
├── auth/
│   ├── LoginForm.tsx        ← Formulario de login
│   ├── RegisterForm.tsx     ← Formulario de registro
│   └── LoginSuccess.tsx     ← Pantalla post-login ✨
│
└── server/
    └── routes/
        └── auth.ts          ← API de autenticación
```

---

## 🧪 Pruebas Rápidas

### Registrar usuario desde terminal:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@test.com",
    "password": "Test123456",
    "role": "TEAM_DEVELOPER"
  }'
```

### Login desde terminal:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@test.com",
    "password": "Test123456"
  }'
```

---

## ✅ Validaciones Implementadas

**En Registro:**
- ✅ Nombre mínimo 3 caracteres
- ✅ Email válido y único
- ✅ Contraseña mínimo 6 caracteres
- ✅ Confirmar contraseña debe coincidir
- ✅ Rol obligatorio

**En Login:**
- ✅ Email obligatorio y válido
- ✅ Contraseña obligatoria
- ✅ Email y contraseña correctos
- ✅ Usuario debe estar activo

---

## 📱 Pantallas Finales

### Pantalla de Login
```
┌─────────────────────────────┐
│      Iniciar Sesión         │
├─────────────────────────────┤
│ Email:      [juan@test.com] │
│ Contraseña: [••••••••]      │
│                             │
│  [Iniciar Sesión]           │
│                             │
│ ¿No tienes cuenta?          │
│ Regístrate aquí ➜           │
└─────────────────────────────┘
```

### Pantalla de Registro
```
┌─────────────────────────────┐
│       Registrarse           │
├─────────────────────────────┤
│ Nombre:     [Juan Pérez]    │
│ Email:      [juan@test.com] │
│ Rol:        [Desarrollador] │
│ Contraseña: [••••••••]      │
│ Confirmar:  [••••••••]      │
│                             │
│  [Registrarse]              │
│                             │
│ ¿Ya tienes cuenta?          │
│ Inicia sesión aquí ➜        │
└─────────────────────────────┘
```

### Pantalla de Éxito
```
┌─────────────────────────────┐
│        ¡Bienvenido!         │
│     Has iniciado sesión     │
├─────────────────────────────┤
│ Nombre:    Juan Pérez       │
│ Correo:    juan@test.com    │
│ Rol:       Desarrollador    │
├─────────────────────────────┤
│ [Ir a Proyectos]            │
│ [Cerrar Sesión]             │
│                             │
│ ID: clx... (usuario)        │
└─────────────────────────────┘
```

---

## 🐛 Si algo falla

### Terminal muestra error en migraciones:
```bash
# Resetear BD (⚠️ ELIMINA DATOS)
npx prisma migrate reset

# Luego:
npm run migrate:dev
```

### "Network error" al registrarse:
- Verifica que backend está corriendo: `npm run dev:server`
- Verifica puerto 5000 está libre
- Revisa consola del navegador (F12)

### "Email ya existe":
- Usa otro email o resetea la BD

---

## 📚 Documentación Completa

Ver `EXECUTION_GUIDE.md` para instrucciones detalladas

---

**¡Listo! 3 comandos y a funcionar:**
```bash
docker run -d --name postgres-workflows -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=workflow_db -p 5432:5432 postgres:latest

npm run migrate:dev

npm run dev:all
```
