# 🎬 PASOS EXACTOS - Paso a Paso

## PASO 1: PostgreSQL (elige una opción)

### Opción A: Docker (Recomendado - Más fácil)

Abre terminal/PowerShell y ejecuta:

```bash
docker run -d \
  --name postgres-workflows \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=workflow_db \
  -p 5432:5432 \
  postgres:latest
```

**Verifica que está corriendo:**
```bash
docker ps | grep postgres-workflows
# Deberías ver una línea con postgres-workflows
```

### Opción B: PostgreSQL Local Instalado

**En macOS:**
```bash
brew services start postgresql
```

**En Linux (Ubuntu/Debian):**
```bash
sudo systemctl start postgresql
```

**En Windows:**
```cmd
net start PostgreSQL-x64-13
```

---

## PASO 2: Verifica el archivo .env

Abre `/home/buga/TGZ/prueba/WorkflowS-project/.env`

**Debe verse así:**
```
DATABASE_URL="postgresql://postgres:123456@localhost:5432/workflow_db"
API_PORT=5000
```

**Si cambió algo, edítalo con tus credenciales reales**

---

## PASO 3: Ejecutar Migraciones

Abre terminal en la carpeta del proyecto:

```bash
cd /home/buga/TGZ/prueba/WorkflowS-project

npm run migrate:dev
```

**Verás algo como:**
```
✔ Your database is now in sync with your schema.

✔ Generated Prisma Client (v7.0.0) to ./src/generated/prisma in 245ms

9 files created

Now you're all set. Run following command to push the schema changes.

npx prisma migrate deploy
```

**SI PREGUNTA por nombre de migración, escribe:**
```
init
```

---

## PASO 4: Iniciar Frontend + Backend

En la misma terminal:

```bash
npm run dev:all
```

**Espera a que aparezca:**
```
✓ Frontend: http://localhost:3000
✓ Backend: http://localhost:5000
```

Se abrirá navegador automáticamente

---

## PASO 5: Registrarse

En http://localhost:3000 verás formulario de **LOGIN**

1. Click en **"Regístrate aquí"** (abajo)
2. Completa el formulario:
   ```
   Nombre: Juan Pérez
   Email: juan@example.com
   Contraseña: Password123
   Confirmar Contraseña: Password123
   Rol: Desarrollador
   ```
3. Click en **"Registrarse"**
4. Verás: **✅ ¡Registro Exitoso!**
5. Automáticamente va a LOGIN

---

## PASO 6: Iniciar Sesión

En página de **LOGIN**:

1. Completa:
   ```
   Email: juan@example.com
   Contraseña: Password123
   ```
2. Click en **"Iniciar Sesión"**
3. **¡ÉXITO!** Pantalla de bienvenida:
   ```
   ¡Bienvenido!
   Has iniciado sesión exitosamente
   
   Nombre: Juan Pérez
   Correo: juan@example.com
   Rol: Desarrollador
   
   [Ir a Proyectos]
   [Cerrar Sesión]
   ```

---

## ✅ ¡LISTO!

Has completado:
- ✓ Registro
- ✓ Login
- ✓ Pantalla de éxito
- ✓ Datos en base de datos

---

## 🎮 Pruebas Adicionales

### Ver Base de Datos (Interfaz Gráfica)

En otra terminal:
```bash
npm run prisma:studio
```

Abre http://localhost:5555 y verás:
- Tabla `users` con tu usuario registrado
- Todos los campos (id, email, name, role, password hasheada)

### Test de API con cURL

**Registrar:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123456",
    "role": "TEAM_DEVELOPER"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

**Respuesta:**
```json
{
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": "clx7...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "TEAM_DEVELOPER"
  }
}
```

---

## 🛑 Si algo falla

### Error: "ECONNREFUSED 127.0.0.1:5432"

**PostgreSQL no está corriendo**

```bash
# Si usas Docker:
docker start postgres-workflows

# Si usas macOS:
brew services start postgresql

# Si usas Linux:
sudo systemctl start postgresql

# Si usas Windows:
net start PostgreSQL-x64-13
```

### Error: "La contraseña o email son incorrectos"

- Verifica que escribes correctamente (mayúsculas/minúsculas)
- Email y contraseña son case-sensitive
- Si olvidaste, registra otro usuario

### Error: "Email ya está registrado"

Usa otro email o resetea la BD:
```bash
npx prisma migrate reset

# Luego:
npm run migrate:dev
```

### Error: "Network Error" en el navegador

Backend no está corriendo:
```bash
npm run dev:server
# En otra terminal
```

O revisa en consola del navegador (F12) qué error específico muestra.

---

## 🔄 Detener Todo

Presiona **Ctrl+C** en la terminal

---

## 📖 Archivos de Documentación

- `QUICK_START.md` - Resumen de 5 minutos
- `EXECUTION_GUIDE.md` - Guía completa con troubleshooting
- `AUTHENTICATION_SUMMARY.md` - Resumen técnico
- Éste archivo - Pasos exactos

---

**¿Necesitas ayuda? Revisa los archivos .md en la raíz del proyecto** 📚
