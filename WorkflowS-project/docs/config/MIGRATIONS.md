# 🗂️ MIGRACIONES - Paso a Paso Exacto

## ¿Qué son las migraciones?

Las migraciones crean las **tablas en PostgreSQL** basadas en tu `schema.prisma`. Sin migraciones, la BD está vacía.

---

## PASO 1: PostgreSQL debe estar corriendo

### Opción A: Docker (Recomendado)

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
# Deberías ver una línea con postgres-workflows
```

### Opción B: PostgreSQL Local

**macOS:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo systemctl start postgresql
```

**Windows:**
```cmd
net start PostgreSQL-x64-13
```

---

## PASO 2: Verificar .env

Abre `/home/buga/TGZ/prueba/WorkflowS-project/.env`

**Debe verse así:**
```
DATABASE_URL="postgresql://postgres:123456@localhost:5432/workflow_db"
API_PORT=5000
```

**⚠️ Si tu PostgreSQL tiene otras credenciales, actualiza aquí**

Ejemplo si tu usuario es `buga`:
```
DATABASE_URL="postgresql://buga:tu_password@localhost:5432/workflow_db"
```

---

## PASO 3: Ejecutar Migraciones (El comando principal)

Abre terminal en la carpeta del proyecto:

```bash
cd /home/buga/TGZ/prueba/WorkflowS-project

npm run migrate:dev
```

---

## PASO 4: Responde la pregunta

Verás:
```
✔ Your database is now in sync with your schema.

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "workflow_db" at "localhost:5432"

✔ Created migration from schema changes (timestamp_migration_name/migration.sql)

No pending migrations to apply.

Generate Prisma Client

✔ Generated Prisma Client

✨ Done in 2.45s
```

O si es la primera vez:

```
prisma migrate dev
✔ Environment variables loaded from .env
? Enter a name for the new migration: › _
```

**ESCRIBE:** `init` (o solo presiona Enter)

Entonces aparecerá:
```
✔ Created migration: ./prisma/migrations/20240119_init/migration.sql

✔ Database synchronized with schema

✔ Generated Prisma Client

✨ Done in 3.21s
```

---

## ✅ ¡LISTO!

Las tablas están creadas. Ahora puedes:

```bash
# Ver las tablas en BD (interfaz gráfica)
npm run prisma:studio

# O iniciar la app
npm run dev:all
```

---

## 🔍 Verificar que se crearon las tablas

### Opción A: Prisma Studio (Visual)

```bash
npm run prisma:studio
```

Abre http://localhost:5555

Verás todas las tablas:
- users
- projects
- tasks
- user_stories
- etc...

### Opción B: Línea de comandos

```bash
psql -U postgres -d workflow_db -c "\dt"
```

Output:
```
               List of relations
 Schema |           Name           | Type  |  Owner
--------+--------------------------+-------+----------
 public | BacklogItem              | table | postgres
 public | Chat                     | table | postgres
 public | Conversation             | table | postgres
 public | ConversationParticipant  | table | postgres
 public | Criteria                 | table | postgres
 public | Evaluation               | table | postgres
 public | EvaluationCriteria       | table | postgres
 public | Message                  | table | postgres
 public | Project                  | table | postgres
 public | ProjectMember            | table | postgres
 public | Rubric                   | table | postgres
 public | Sprint                   | table | postgres
 public | Task                     | table | postgres
 public | User                     | table | postgres
 public | UserStory                | table | postgres
```

---

## 📝 Comandos de Migraciones

```bash
# Crear migración (primera vez o después de cambiar schema)
npm run migrate:dev

# Ver estado de migraciones
npx prisma migrate status

# Aplicar migraciones en producción
npm run migrate:prod

# Resetear BD (⚠️ ELIMINA TODO)
npx prisma migrate reset

# Crear migraciones pendientes
npx prisma migrate deploy

# Ver historial de migraciones
ls prisma/migrations/
```

---

## 📂 Qué se crea

Cuando ejecutas `npm run migrate:dev`:

```
prisma/
├── migrations/
│   ├── migration_lock.toml          ← Lock para evitar conflictos
│   └── 20240119_init/
│       └── migration.sql            ← SQL que se ejecutó
├── schema.prisma                    ← Tu definición de modelos
└── generated/
    └── prisma/
        └── index.d.ts               ← Tipos TypeScript generados
```

---

## ⚠️ Errores Comunes

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

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

### Error: "database does not exist"

**Base de datos no existe**

Crea la BD:
```bash
psql -U postgres -c "CREATE DATABASE workflow_db;"
```

O cambia `.env`:
```
DATABASE_URL="postgresql://postgres:123456@localhost:5432/postgres"
# Usa 'postgres' (BD por defecto) para primera migración
```

### Error: "role postgres does not exist"

**Usuario no existe**

```bash
# Crear usuario
psql -U postgres -c "CREATE USER postgres WITH PASSWORD '123456';"
```

### Error: "already exists"

**Migración ya se ejecutó**

Está bien, significa que las tablas ya están creadas. Continúa con:
```bash
npm run dev:all
```

---

## 🔄 Flujo Completo de Migraciones

```
1. Editar prisma/schema.prisma
   ↓
2. npm run migrate:dev
   ↓
3. Responder nombre: "update_users" (o presionar Enter)
   ↓
4. Se crea: prisma/migrations/[timestamp]_update_users/migration.sql
   ↓
5. SQL se ejecuta en PostgreSQL
   ↓
6. Tabla actualizada en BD
   ↓
7. Prisma Client regenerado
   ↓
8. Cambios listos para usar
```

---

## 📋 Checklist Migraciones

- [ ] PostgreSQL corriendo
- [ ] `.env` con credenciales correctas
- [ ] `npm run migrate:dev` ejecutado
- [ ] Respondiste con "init" o presionaste Enter
- [ ] Viste "✔ Database synchronized"
- [ ] Tablas visibles en Prisma Studio: `npm run prisma:studio`

---

## 💡 Tips Importantes

✅ **Ejecuta migraciones UNA SOLA VEZ la primera vez**
- Si ejecutas 2 veces, la 2da dirá "No pending migrations"
- Está bien, Prisma evita duplicados

✅ **Después de cambiar schema.prisma, siempre migra:**
```bash
# Cambias schema.prisma
# Luego:
npm run migrate:dev
```

✅ **En producción, usa:**
```bash
npm run migrate:prod
```

✅ **Para resetear todo (desarrollo):**
```bash
npx prisma migrate reset
# Responde "y" para confirmar
# Se eliminan TODOS los datos ⚠️
```

---

## 🎯 Después de Migraciones

```bash
# Opción 1: Ver BD visualmente
npm run prisma:studio

# Opción 2: Iniciar app
npm run dev:all

# Opción 3: Solo backend
npm run dev:server
```

---

## 📊 Schema.prisma Actual

Tu proyecto tiene estos modelos listos para migrar:

```
✓ User               → usuarios
✓ Project           → proyectos
✓ ProjectMember     → miembros de proyectos
✓ Sprint            → sprints
✓ UserStory         → historias de usuario
✓ BacklogItem       → items del backlog
✓ Task              → tareas
✓ Rubric            → rúbricas
✓ Criteria          → criterios de evaluación
✓ Evaluation        → evaluaciones
✓ EvaluationCriteria→ detalles de evaluación
✓ Chat              → salas de chat
✓ Conversation      → conversaciones
✓ ConversationParticipant → participantes
✓ Message           → mensajes
```

---

## ✨ Resultado Final

Después de `npm run migrate:dev`:

```
PostgreSQL (workflow_db)
│
├─ users (tabla)
│  ├─ id (CUID)
│  ├─ email (UNIQUE)
│  ├─ name
│  ├─ password (hasheada)
│  ├─ role (enum)
│  ├─ active (boolean)
│  ├─ createdAt
│  └─ updatedAt
│
├─ projects (tabla)
│  ├─ id
│  ├─ name
│  ├─ ownerId (FK → users)
│  └─ ...
│
├─ tasks (tabla)
│  ├─ id
│  ├─ projectId (FK → projects)
│  ├─ assigneeId (FK → users)
│  └─ ...
│
└─ [11 tablas más]
```

---

**¿Dudas? Revisa `STEP_BY_STEP.md` para pasos exactos** 📚
