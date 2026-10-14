# 📊 WorkflowS - Guía de Configuración PostgreSQL

## 🔧 Configuración Inicial

### 1. **Instalación de dependencias** ✅
```bash
npm install
```

### 2. **Configurar PostgreSQL**

#### Opción A: PostgreSQL Local instalado
```bash
# Ajusta las credenciales en .env
# .env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/workflows?schema=public"
```

#### Opción B: PostgreSQL con Docker
```bash
docker run -d \
  --name postgres-workflows \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=workflows \
  -p 5432:5432 \
  postgres:latest

# Verifica la conexión
psql -h localhost -U postgres -d workflows
```

### 3. **Ejecutar Migraciones**
```bash
# Primera migración (crea todas las tablas)
npm run migrate:dev

# En producción
npm run migrate:prod
```

### 4. **Iniciar el Proyecto**

#### Solo Frontend (Rsbuild)
```bash
npm run dev
# Accede a http://localhost:3000
```

#### Solo Backend (Express)
```bash
npm run dev:server
# API disponible en http://localhost:5000/api
```

#### Frontend + Backend (Recomendado)
```bash
npm run dev:all
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/api
```

---

## 📚 Estructura del Proyecto

```
src/
├── server/
│   ├── index.ts              # Servidor Express principal
│   ├── db.ts                 # Instancia de Prisma
│   ├── routes/
│   │   ├── users.ts          # CRUD de usuarios
│   │   ├── projects.ts       # CRUD de proyectos
│   │   ├── tasks.ts          # CRUD de tareas
│   │   └── user-stories.ts   # CRUD de user stories
│   └── middleware/           # Middlewares (auth, validación, etc)
├── api/
│   └── client.ts             # Cliente fetch para React
├── App.tsx
└── index.tsx

prisma/
├── schema.prisma             # Esquema de BD (modelos)
└── migrations/               # Historial de cambios
```

---

## 🗂️ Modelos de Base de Datos

### User (Usuarios)
- `id`: Identificador único (CUID)
- `email`: Email único
- `name`: Nombre completo
- `password`: Contraseña (hashear en producción)
- `role`: ADMIN | PRODUCT_OWNER | SCRUM_MASTER | TEAM_DEVELOPER
- `avatar`: URL de foto
- `active`: Estado activo/inactivo
- `createdAt`, `updatedAt`: Timestamps

### Project (Proyectos)
- `id`: Identificador único
- `name`: Nombre del proyecto
- `description`: Descripción
- `status`: ACTIVE | ARCHIVED | COMPLETED
- `ownerId`: ID del propietario
- `members`: Miembros del proyecto
- `sprints`: Sprints del proyecto

### Task (Tareas)
- `id`: Identificador único
- `title`: Título
- `description`: Descripción
- `priority`: LOW | MEDIUM | HIGH | CRITICAL
- `status`: TODO | IN_PROGRESS | IN_REVIEW | DONE | BLOCKED
- `assigneeId`: Asignado a usuario
- `projectId`: Proyecto asociado
- `deadline`: Fecha límite

### UserStory (Historias de usuario)
- `id`: Identificador único
- `title`: Título
- `description`: Descripción
- `acceptance`: Criterios de aceptación
- `storyPoints`: Puntos de historia
- `status`: BACKLOG | IN_PROGRESS | IN_REVIEW | DONE
- `priority`: LOW | MEDIUM | HIGH | CRITICAL

### BacklogItem (Items de Backlog)
- `id`: Identificador único
- `title`: Título
- `priority`: Prioridad
- `storyPoints`: Puntos
- `status`: TODO | IN_PROGRESS | IN_REVIEW | DONE

### Sprint
- `id`: Identificador único
- `name`: Nombre del sprint
- `startDate`: Fecha de inicio
- `endDate`: Fecha de fin
- `status`: PLANNING | ACTIVE | COMPLETED | CANCELLED

### Evaluation (Evaluaciones)
- `id`: Identificador único
- `taskId`: Tarea evaluada
- `evaluatorId`: Usuario que evalúa
- `score`: Puntuación
- `feedback`: Comentarios
- `status`: PENDING | IN_PROGRESS | COMPLETED | REJECTED

### Chat y Conversations
- `Chat`: Sala de chat de un proyecto
- `Conversation`: Conversación dentro de un chat
- `Message`: Mensajes en una conversación

---

## 🔗 API Endpoints

### Usuarios
```
GET    /api/users              # Obtener todos
GET    /api/users/:id          # Obtener uno
POST   /api/users              # Crear
PUT    /api/users/:id          # Actualizar
DELETE /api/users/:id          # Eliminar
```

### Proyectos
```
GET    /api/projects           # Obtener todos
GET    /api/projects/:id       # Obtener uno
POST   /api/projects           # Crear
PUT    /api/projects/:id       # Actualizar
DELETE /api/projects/:id       # Eliminar
```

### Tareas
```
GET    /api/tasks              # Obtener todos
GET    /api/tasks/:id          # Obtener uno
POST   /api/tasks              # Crear
PUT    /api/tasks/:id          # Actualizar
DELETE /api/tasks/:id          # Eliminar
```

### User Stories
```
GET    /api/user-stories       # Obtener todos
GET    /api/user-stories/:id   # Obtener uno
POST   /api/user-stories       # Crear
PUT    /api/user-stories/:id   # Actualizar
DELETE /api/user-stories/:id   # Eliminar
```

### Health Check
```
GET    /api/health             # Estado del servidor
```

---

## 💻 Usar API desde React

Importa el cliente API en tus componentes:

```typescript
import { userAPI, projectAPI, taskAPI, userStoryAPI } from "@/api/client";

// En un componente
async function loadUsers() {
  try {
    const users = await userAPI.getAll();
    console.log(users);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Crear usuario
async function createUser() {
  await userAPI.create({
    email: "dev@example.com",
    name: "Juan Desarrollador",
    password: "securePassword123",
    role: "TEAM_DEVELOPER"
  });
}

// Obtener proyecto con sus datos
const project = await projectAPI.getById("proyecto-id");

// Crear tarea
await taskAPI.create({
  title: "Implementar autenticación",
  description: "Agregar JWT authentication",
  projectId: "proyecto-id",
  assigneeId: "usuario-id",
  priority: "HIGH",
  deadline: "2025-12-31"
});
```

---

## 🛠️ Comandos Útiles

```bash
# Ver la BD en UI web
npm run prisma:studio

# Ver migraciones pendientes
npx prisma migrate status

# Reset BD (cuidado: elimina datos)
npx prisma migrate reset

# Generar tipos TypeScript de modelos
npx prisma generate

# Ver logs de Prisma
export DEBUG=prisma:*
npm run dev:server

# Linting y formateo
npm run format
npm run check
```

---

## 🔐 Notas de Seguridad

1. **Hashear contraseñas**: Instala `bcrypt` y hashea en la ruta POST /users
   ```bash
   npm install bcrypt
   npm install --save-dev @types/bcrypt
   ```

2. **Validación**: Agrega validación con `zod` o `joi`
3. **CORS**: Configura CORS por dominio en producción
4. **JWT**: Implementa autenticación con tokens JWT
5. **Variables de entorno**: Nunca commitees `.env` con datos reales

---

## 📖 Documentación Oficial

- [Prisma Docs](https://www.prisma.io/docs/)
- [Express Docs](https://expressjs.com/)
- [Rsbuild Docs](https://rsbuild.rs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## ❓ Troubleshooting

### Error: "connect ECONNREFUSED"
PostgreSQL no está corriendo. Inicia PostgreSQL:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
net start PostgreSQL-x64-13
```

### Error: "Could not find a declaration file"
Instala los tipos TypeScript:
```bash
npm install --save-dev @types/[package-name]
```

### Migraciones conflictivas
```bash
# Reset la BD (cuidado: pierde datos)
npx prisma migrate reset

# O resuelve manualmente
npx prisma migrate resolve --rolled-back [nombre_migracion]
```

---

**🎉 ¡Listo! Tu setup de PostgreSQL con React + Express está completo.**
