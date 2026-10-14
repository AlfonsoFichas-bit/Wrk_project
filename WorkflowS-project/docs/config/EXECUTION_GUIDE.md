# 🚀 Guía Completa: Ejecutar Migraciones y Login

## Paso 1: Verificar PostgreSQL

### Opción A: PostgreSQL Local (instalado)
```bash
# Verificar si está corriendo
psql --version

# Si no está corriendo, iniciarlo:
# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Windows:
net start PostgreSQL-x64-13
```

### Opción B: PostgreSQL con Docker (Recomendado)
```bash
# Crear contenedor de PostgreSQL
docker run -d \
  --name postgres-workflows \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=workflow_db \
  -p 5432:5432 \
  postgres:latest

# Verificar que está corriendo
docker ps | grep postgres-workflows
```

## Paso 2: Verificar Variables de Entorno

```bash
# Revisar .env
cat .env

# Debería verse así:
# DATABASE_URL="postgresql://postgres:123456@localhost:5432/workflow_db"
# API_PORT=5000
```

Si tienes credenciales diferentes, actualiza `.env`:
```bash
DATABASE_URL="postgresql://TU_USER:TU_PASSWORD@localhost:5432/TU_DB"
```

## Paso 3: Probar Conexión a Base de Datos

```bash
# Conectar a PostgreSQL (si está local)
psql -U postgres -d workflow_db

# Dentro de psql:
\dt              # Ver tablas
\q               # Salir
```

## Paso 4: Ejecutar Migraciones

```bash
# Crear migraciones iniciales (primera vez)
npm run migrate:dev

# Responde las preguntas:
# 1. "Enter a name for the new migration" → escribe: init
# Presiona Enter

# Esto creará:
# - prisma/migrations/20250119_init/migration.sql
# - Todas las tablas en PostgreSQL
```

## Paso 5: Verificar Tablas Creadas

```bash
# Ver las tablas creadas
psql -U postgres -d workflow_db -c "\dt"

# Deberías ver tablas como:
# users | public | table | postgres
# projects | public | table | postgres
# tasks | public | table | postgres
# etc...
```

Alternativa visual:
```bash
# Abrir Prisma Studio (interfaz gráfica)
npm run prisma:studio

# Se abre en http://localhost:5555
```

## Paso 6: Iniciar el Servidor Backend

**Opción A: Solo Backend**
```bash
npm run dev:server

# Verás:
# 🚀 API Server corriendo en http://localhost:5000
# 📚 Rutas disponibles:
#    POST   /api/auth/register
#    POST   /api/auth/login
```

**Opción B: Frontend + Backend (Recomendado)**
```bash
npm run dev:all

# Se abrirán dos procesos:
# - Frontend en http://localhost:3000
# - Backend en http://localhost:5000
```

## Paso 7: Registrarse

1. Ve a http://localhost:3000
2. Click en "Regístrate aquí"
3. Completa el formulario:
   ```
   Nombre: Juan Pérez
   Email: juan@example.com
   Contraseña: Password123
   Confirmar: Password123
   Rol: Desarrollador (o tu rol)
   ```
4. Click en "Registrarse"
5. Verás: "¡Registro Exitoso! Ahora puedes iniciar sesión."
6. Se redirige automáticamente a login

## Paso 8: Iniciar Sesión

1. Completa el formulario:
   ```
   Email: juan@example.com
   Contraseña: Password123
   ```
2. Click en "Iniciar Sesión"
3. ¡Éxito! Ves la pantalla: "¡Bienvenido!"
4. Información del usuario:
   ```
   Nombre: Juan Pérez
   Correo: juan@example.com
   Rol: Desarrollador
   ```

## Paso 9: Botones en Pantalla de Éxito

- **Ir a Proyectos**: Navega a `/projects`
- **Cerrar Sesión**: Limpia `localStorage` y vuelve a `/login`

---

## 🔧 Comandos Útiles

```bash
# Ver migraciones
npx prisma migrate status

# Ver BD en interfaz gráfica
npm run prisma:studio

# Limpiar y resetear BD (⚠️ ELIMINA DATOS)
npx prisma migrate reset

# Crear nueva migración (después de cambiar schema.prisma)
npm run migrate:dev

# Ejecutar linter
npm run format
npm run check
```

---

## ❌ Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
**Causa:** PostgreSQL no está corriendo
```bash
# Si usas Docker:
docker start postgres-workflows

# Si es local:
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

### Error: "role postgres does not exist"
```bash
# Crear el rol:
psql -U postgres -c "CREATE USER postgres WITH PASSWORD '123456';"
```

### Error: "database does not exist"
```bash
# Crear la BD:
psql -U postgres -c "CREATE DATABASE workflow_db;"
```

### Error: "Duplicate key value violates unique constraint"
```bash
# Email ya registrado con otro usuario
# Usa otro email o resetea la BD:
npx prisma migrate reset
```

### Error en Auth: "fetch failed"
- Asegúrate que el backend está corriendo: `npm run dev:server`
- Verifica que puerto 5000 está abierto
- Revisa que CORS está habilitado

### Contraseña incorrecta en login
- Verifica que la contraseña es correcta
- Passwords son case-sensitive

---

## 📋 Resumen de Flujo

```
1. PostgreSQL corriendo ✓
2. npm run migrate:dev ✓
3. npm run dev:all ✓
4. http://localhost:3000 en navegador
5. Registrarse → Éxito
6. Ir a Login → Iniciar Sesión
7. ¡Bienvenido! → Dashboard
```

---

## 🔐 Estructura de Seguridad

**Implementado:**
- ✅ Hashing de contraseñas con bcryptjs
- ✅ Validación de email
- ✅ Validación de longitud de contraseña
- ✅ Validación de confirmación de contraseña
- ✅ Check de usuario activo
- ✅ CORS habilitado

**Para Producción:**
- [ ] JWT (JSON Web Tokens)
- [ ] Refresh tokens
- [ ] HTTPS
- [ ] Rate limiting
- [ ] Password reset por email
- [ ] 2FA (Two-Factor Authentication)

---

¡Listo para empezar! 🚀
