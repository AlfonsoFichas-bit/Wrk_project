# 🎯 GUÍA COMPLETA FINAL - Migraciones & Login

## ⚡ RESUMEN RÁPIDO (5 MINUTOS)

### 1. PostgreSQL corriendo
```bash
# Docker (recomendado)
docker run -d --name postgres-workflows \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=workflow_db \
  -p 5432:5432 \
  postgres:latest

# O si está instalado localmente:
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: net start PostgreSQL-x64-13
```

### 2. Ejecutar migraciones
```bash
npm run migrate:dev
# Responde: init (o presiona Enter)
```

### 3. Iniciar app
```bash
npm run dev:all
```

### 4. Accede a http://localhost:3000 y:
- **Regístrate** (nuevo usuario)
- **Inicia sesión** (con tus datos)
- ¡**Éxito**! Ves pantalla de bienvenida

---

## 📋 PASOS DETALLADOS

### PASO 1: PostgreSQL

Elige una opción:

**Opción A: Docker (Más fácil)**
```bash
docker run -d \
  --name postgres-workflows \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=workflow_db \
  -p 5432:5432 \
  postgres:latest
```

Verifica:
```bash
docker ps | grep postgres-workflows
```

**Opción B: PostgreSQL Instalado**

macOS:
```bash
brew services start postgresql
```

Linux:
```bash
sudo systemctl start postgresql
sudo -u postgres psql -d postgres
# Dentro de psql:
CREATE DATABASE workflow_db;
\q
```

Windows:
```cmd
net start PostgreSQL-x64-13
```

---

### PASO 2: Verificar .env

Archivo: `/home/buga/TGZ/prueba/WorkflowS-project/.env`

Debe contener:
```
DATABASE_URL="postgresql://postgres:123456@localhost:5432/workflow_db"
API_PORT=5000
```

**Si tienes credenciales diferentes, actualiza aquí.**

---

### PASO 3: MIGRACIONES (Lo importante)

Abre terminal en carpeta del proyecto:

```bash
cd /home/buga/TGZ/prueba/WorkflowS-project

npm run migrate:dev
```

**Verás:**
```
Environment variables loaded from .env

? Enter a name for the new migration: › _
```

**Escribe:** `init` y presiona Enter

O solo presiona Enter (auto-genera nombre)

**Output esperado:**
```
✔ Created migration: ./prisma/migrations/20240119_init/migration.sql
✔ Database synchronized with schema
✔ Generated Prisma Client
✨ Done in 3.21s
```

**¡Las tablas se han creado!**

---

### PASO 4: Verificar Tablas Creadas

**Opción A: Prisma Studio (Visual)**
```bash
npm run prisma:studio
```
Abre http://localhost:5555

Ver todas las tablas:
- users
- projects
- tasks
- user_stories
- etc...

**Opción B: Línea de comandos**
```bash
psql -U postgres -d workflow_db -c "\dt"
```

---

### PASO 5: Iniciar App

Terminal 1 (Backend + Frontend):
```bash
npm run dev:all
```

Espera a ver:
```
✓ Frontend corriendo en http://localhost:3000
✓ Backend corriendo en http://localhost:5000
```

Se abre navegador automáticamente

---

### PASO 6: Registrarse

En http://localhost:3000:

1. Verás formulario de **LOGIN**
2. Click en **"Regístrate aquí"**
3. Completa:
   ```
   Nombre: Tu Nombre
   Email: tu@email.com
   Contraseña: Minimo6caracteres
   Confirmar: Minimo6caracteres
   Rol: Desarrollador (puedes cambiar)
   ```
4. Click **"Registrarse"**
5. Mensaje: **✅ ¡Registro Exitoso!**
6. Redirige a **LOGIN automáticamente**

---

### PASO 7: Iniciar Sesión

En página de LOGIN:

1. Email: `tu@email.com`
2. Contraseña: `Minimo6caracteres`
3. Click **"Iniciar Sesión"**
4. **¡ÉXITO!** Ves pantalla:

```
╔═══════════════════════════════╗
│       ¡Bienvenido!            │
│  Has iniciado sesión          │
├───────────────────────────────┤
│ Nombre:   Tu Nombre           │
│ Correo:   tu@email.com        │
│ Rol:      Desarrollador       │
├───────────────────────────────┤
│ [Ir a Proyectos]              │
│ [Cerrar Sesión]               │
└═══════════════════════════════┘
```

---

## 🗂️ COMANDOS DE MIGRACIONES

```bash
# Crear migraciones (primera vez)
npm run migrate:dev

# Ver estado
npx prisma migrate status

# Aplicar en producción
npm run migrate:prod

# Resetear BD (⚠️ ELIMINA DATOS)
npx prisma migrate reset

# Ver BD visualmente
npm run prisma:studio
```

---

## 📂 Qué se crea después de migraciones

```
prisma/
├── migrations/
│   ├── migration_lock.toml
│   └── 20240119_init/
│       └── migration.sql       ← SQL ejecutado
│
postgre.sql (workflow_db)
├── users (tabla)
│   ├─ id
│   ├─ email
│   ├─ name
│   ├─ password
│   ├─ role
│   ├─ active
│   ├─ createdAt
│   └─ updatedAt
│
├── projects
├── tasks
├── user_stories
├── (y 11 tablas más)
```

---

## ✅ Checklist

- [ ] PostgreSQL corriendo
- [ ] .env con credenciales correctas
- [ ] `npm run migrate:dev` ejecutado
- [ ] Viste "✔ Database synchronized"
- [ ] Tablas visibles en `npm run prisma:studio`
- [ ] `npm run dev:all` iniciado
- [ ] http://localhost:3000 abierto
- [ ] Registrado correctamente
- [ ] Login exitoso
- [ ] Pantalla de bienvenida visible

---

## ⚠️ Errores y Soluciones

| Problema | Causa | Solución |
|----------|-------|----------|
| "ECONNREFUSED 127.0.0.1:5432" | PostgreSQL no corre | `docker start postgres-workflows` |
| "database does not exist" | BD no existe | `psql -U postgres -c "CREATE DATABASE workflow_db;"` |
| "role does not exist" | Usuario no existe | `psql -U postgres -c "CREATE USER postgres WITH PASSWORD '123456';"` |
| "Email ya existe" | Registrado ya | Usa otro email |
| "Network Error" en navegador | Backend no corre | Abre otra terminal: `npm run dev:server` |
| "Cannot find module" | Import incorrecto | Revisa `IMPORTS_GUIDE.md` |

---

## 🚀 Flujo Completo

```
PostgreSQL corriendo
         ↓
npm run migrate:dev
         ↓
Tablas creadas en BD
         ↓
npm run dev:all
         ↓
Frontend: http://localhost:3000
Backend:  http://localhost:5000
         ↓
Registrarse (nuevo usuario)
         ↓
Iniciar Sesión
         ↓
✅ Pantalla de Bienvenida
```

---

## 📚 Documentación Disponible

- `MIGRATIONS.md` - Guía detallada de migraciones
- `STEP_BY_STEP.md` - Pasos exactos
- `QUICK_START.md` - Resumen rápido
- `AUTHENTICATION_SUMMARY.md` - Resumen técnico
- `IMPORTS_GUIDE.md` - Importaciones correctas
- `EXECUTION_GUIDE.md` - Guía completa

---

## 🎯 Próximos Pasos (Opcionales)

Después de login exitoso, puedes:

1. **Ver BD**: `npm run prisma:studio`
2. **Crear más usuarios**: Repite registro/login
3. **Crear proyectos**: A través de API o interfaz
4. **Agregar JWT**: Para seguridad mejorada
5. **Deploy**: A producción

---

## 💡 Recuerda

- Las migraciones crean tablas **UNA SOLA VEZ**
- Si ejecutas 2 veces, la 2da dice "No pending"
- Está bien, Prisma evita duplicados
- Para cambios posteriores:
  ```bash
  # Editas schema.prisma
  npm run migrate:dev
  ```

---

## ¡Listo! 🎉

Tienes un sistema de autenticación completo con:
- ✅ Login & Register
- ✅ Base de datos PostgreSQL
- ✅ Contraseñas hasheadas (bcryptjs)
- ✅ Validación en cliente y servidor
- ✅ Pantalla de éxito
- ✅ React Router para navegación
- ✅ TypeScript 100%
- ✅ Tailwind CSS

**Comienza con `npm run migrate:dev` 🚀**
