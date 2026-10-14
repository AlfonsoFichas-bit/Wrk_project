# ⚠️ IMPORTACIONES CORRECTAS - Evita errores

## Frontend (React)

### LoginForm.tsx
```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
```

### RegisterForm.tsx
```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
```

### LoginSuccess.tsx
```typescript
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
```

### App.tsx
```typescript
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';
import { LoginSuccess } from './auth/LoginSuccess';
import { ProjectsList } from './components/ProjectsList';
```

---

## Backend (Node.js/Express)

### src/server/index.ts
```typescript
import express, { type Express } from "express";
import cors from "cors";
import "dotenv/config";

import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import projectsRouter from "./routes/projects";
import tasksRouter from "./routes/tasks";
import userStoriesRouter from "./routes/user-stories";
```

### src/server/routes/auth.ts
```typescript
import { Router } from "express";
import bcryptjs from "bcryptjs";
import { prisma } from "../db";
```

### src/server/db.ts
```typescript
import { PrismaClient } from "@prisma/client";
```

---

## Alias de Importación (TypeScript)

El proyecto está configurado con alias `@/` en `tsconfig.json`:

```typescript
// ✅ CORRECTO
import { LoginForm } from "@/auth/LoginForm";
import { projectAPI } from "@/api/client";

// ❌ INCORRECTO
import { LoginForm } from "../../../auth/LoginForm";
import { projectAPI } from "../../../api/client";
```

---

## Variables de Entorno (.env)

```
DATABASE_URL="postgresql://postgres:123456@localhost:5432/workflow_db"
API_PORT=5000
```

---

## npm Packages Instalados

```json
{
  "dependencies": {
    "@prisma/client": "^7.0.0",
    "@tailwindcss/postcss": "^4.1.17",
    "@types/express": "^5.0.5",
    "@types/node": "^24.10.1",
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "pg": "^8.16.3",
    "postcss": "^8.5.6",
    "prisma": "^7.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.9.6",
    "tailwindcss": "^4.1.17",
    "ts-node": "^10.9.2"
  },
  "devDependencies": {
    "@biomejs/biome": "2.3.2",
    "@rsbuild/core": "^1.6.4",
    "@rsbuild/plugin-react": "^1.4.2",
    "@types/cors": "^2.8.19",
    "@types/react": "^19.2.4",
    "@types/react-dom": "^19.2.3",
    "concurrently": "^9.2.1",
    "typescript": "^5.9.3"
  }
}
```

---

## Rutas del Servidor

### Autenticación
```
POST   /api/auth/register     Registrar usuario
POST   /api/auth/login        Iniciar sesión
POST   /api/auth/logout       Cerrar sesión
```

### CRUD
```
GET    /api/users             Obtener usuarios
POST   /api/users             Crear usuario
GET    /api/projects          Obtener proyectos
POST   /api/projects          Crear proyecto
GET    /api/tasks             Obtener tareas
POST   /api/tasks             Crear tarea
GET    /api/user-stories      Obtener historias
POST   /api/user-stories      Crear historia
```

### Health Check
```
GET    /api/health            Estado del servidor
```

---

## Rutas Frontend (React Router)

```
/login                Formulario de login
/register             Formulario de registro
/login-success        Pantalla tras login exitoso
/projects             Lista de proyectos (protegida)
/                     Redirecciona a /login
```

---

## Estructura de Carpetas Esperada

```
src/
├── auth/                    ← Componentes de autenticación
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── LoginSuccess.tsx
│
├── api/                     ← Cliente API
│   └── client.ts
│
├── components/              ← Componentes reutilizables
│   └── ProjectsList.tsx
│
├── server/                  ← Backend Express
│   ├── index.ts
│   ├── db.ts
│   └── routes/
│       ├── auth.ts
│       ├── users.ts
│       ├── projects.ts
│       ├── tasks.ts
│       └── user-stories.ts
│
├── App.tsx                  ← Configuración de rutas
├── index.tsx
└── App.css

prisma/
├── schema.prisma           ← Definición de BD
└── migrations/             ← Historial de cambios

.env                        ← Variables de entorno
tsconfig.json               ← Config TypeScript
package.json                ← Dependencias
```

---

## Validaciones de Datos

### Registro
- ✅ Nombre: mínimo 3 caracteres
- ✅ Email: formato válido + único en BD
- ✅ Contraseña: mínimo 6 caracteres
- ✅ Confirmar: debe coincidir con contraseña
- ✅ Rol: obligatorio (TEAM_DEVELOPER, SCRUM_MASTER, PRODUCT_OWNER, ADMIN)

### Login
- ✅ Email: obligatorio + formato válido
- ✅ Contraseña: obligatoria
- ✅ Verificación: coincide en BD
- ✅ Usuario: debe estar activo (active: true)

---

## localStorage

Después de login exitoso:
```javascript
localStorage.setItem("user", JSON.stringify({
  id: "clx7...",
  name: "Juan Pérez",
  email: "juan@example.com",
  role: "TEAM_DEVELOPER"
}));

// Recuperar:
const user = JSON.parse(localStorage.getItem("user"));

// Borrar (logout):
localStorage.removeItem("user");
```

---

## Hashing de Contraseñas

Usando bcryptjs:
```typescript
import bcryptjs from "bcryptjs";

// Crear hash
const hashedPassword = await bcryptjs.hash(password, 10);

// Verificar
const matches = await bcryptjs.compare(password, hashedPassword);
```

---

## Errores Comunes de Importación

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot find module '@/auth/LoginForm'` | Alias no configurado | Verifica `tsconfig.json` tenga `baseUrl` y `paths` |
| `Cannot find module 'react-router-dom'` | No instalado | `npm install react-router-dom` |
| `Cannot find module 'bcryptjs'` | No instalado | `npm install bcryptjs` |
| `Cannot find module '@prisma/client'` | No instalado | `npm install @prisma/client prisma` |

---

## Verificar Importaciones

En VS Code:
```
1. Ctrl+Shift+P (o Cmd+Shift+P en macOS)
2. TypeScript: Reload Projects
3. Espera 10 segundos
4. Los errores deberían desaparecer
```

---

**Si tienes dudas sobre importaciones, revisa los archivos .tsx en `src/auth/`** 📝
