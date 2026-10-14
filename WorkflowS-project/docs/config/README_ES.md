# 📚 ÍNDICE DE DOCUMENTACIÓN

## 🎯 Empezar Aquí

**Lee en este orden:**

### 1. **MIGRACIONES_COMPLETO.md** ⭐
   - Guía COMPLETA de migraciones
   - Pasos 1-7 para tener todo funcional
   - Errores y soluciones
   - **COMIENZA AQUÍ**

### 2. **STEP_BY_STEP.md**
   - Pasos exactos línea por línea
   - Qué esperar en cada paso
   - Troubleshooting detallado

### 3. **QUICK_START.md**
   - Resumen de 5 minutos
   - Solo los comandos esenciales
   - Para cuando ya lo sabes

---

## 📖 Guías Específicas

### **MIGRATIONS.md**
- Qué son las migraciones
- Cómo ejecutarlas
- Comandos disponibles
- Verificar tablas creadas

### **POSTGRESQL_SETUP.md**
- Setup completo de PostgreSQL
- Configuración de variables de entorno
- Estructura de base de datos
- Notas de seguridad

### **EXECUTION_GUIDE.md**
- Guía detallada de ejecución
- Cómo iniciar servidor
- Uso desde React
- Troubleshooting extenso

### **AUTHENTICATION_SUMMARY.md**
- Resumen técnico de autenticación
- Flujo de usuario
- Seguridad implementada
- Próximos pasos

### **IMPORTS_GUIDE.md**
- Importaciones correctas
- Estructura de carpetas
- Alias de rutas
- Errores de importación

---

## 🚀 Scripts Automáticos

### **scripts/migrate.sh** (macOS/Linux)
```bash
chmod +x scripts/migrate.sh
./scripts/migrate.sh
```

### **scripts/setup.sh** (macOS/Linux)
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```
Menú interactivo para migraciones

### **migrate.bat** (Windows)
```cmd
migrate.bat
```
Menú interactivo para migraciones

### **scripts/setup.sh** (macOS/Linux)
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```
Ejecuta automáticamente todo

### **setup.bat** (Windows)
```cmd
setup.bat
```
Ejecuta automáticamente todo

---

## 📋 Comandos Principales

```bash
# MIGRACIONES
npm run migrate:dev         # Crear migraciones (primera vez)
npm run migrate:prod        # Aplicar en producción
npx prisma migrate status   # Ver estado
npx prisma migrate reset    # Resetear BD (⚠️)

# DESARROLLO
npm run dev:all            # Frontend + Backend
npm run dev:server         # Solo backend
npm run dev                # Solo frontend

# VER BD
npm run prisma:studio      # Interfaz gráfica (http://localhost:5555)

# LINTING
npm run format             # Formatear código
npm run check              # Verificar errores

# CONSTRUCCIÓN
npm run build              # Build para producción
npm run preview            # Previsualizar build
```

---

## 🔄 Cambiar Base de Datos (Switch DB)

Para alternar fácilmente entre SQLite y PostgreSQL:

```bash
npm run switch-db
# O directamente: ./scripts/switch-db.sh
```

**Qué hace:**
- Cambia el provider en `prisma/schema.prisma`
- Actualiza `DATABASE_URL` en `.env`
- Ejecuta migraciones automáticamente
- Genera el cliente Prisma

**Notas importantes:**
- Si tienes datos en la BD actual, **expórtalos primero** (no se migra automáticamente)
- Asegúrate de que PostgreSQL esté corriendo antes de cambiar a él
- Reinicia el servidor después del cambio

---

## 🗺️ Estructura del Proyecto

```
/
├── README.md                      # Proyecto original
├── package.json                   # Dependencias
├── tsconfig.json                  # Config TypeScript
├── rsbuild.config.ts             # Config Rsbuild
├── .env                          # Variables de entorno
│
├── 📚 DOCUMENTACIÓN
│   ├── MIGRACIONES_COMPLETO.md  ⭐ COMIENZA AQUÍ
│   ├── STEP_BY_STEP.md
│   ├── QUICK_START.md
│   ├── MIGRATIONS.md
│   ├── POSTGRESQL_SETUP.md
│   ├── EXECUTION_GUIDE.md
│   ├── AUTHENTICATION_SUMMARY.md
│   ├── IMPORTS_GUIDE.md
│   └── SETUP_SUMMARY.md
│
├── 🔧 SCRIPTS
│   ├── scripts/
│   │   ├── setup.sh             # Automático (macOS/Linux)
│   │   ├── setup.bat            # Automático (Windows)
│   │   ├── migrate.sh           # Migraciones (macOS/Linux)
│   │   ├── migrate.bat          # Migraciones (Windows)
│   │   ├── switch-db.sh         # Cambiar entre SQLite/PostgreSQL
│   │   └── CHECKLIST.sh         # Checklist del proyecto
│
├── src/
│   ├── App.tsx                  # Router principal
│   ├── index.tsx                # Entry point
│   ├── App.css
│   │
│   ├── 🔐 auth/
│   │   ├── LoginForm.tsx        # Formulario login
│   │   ├── RegisterForm.tsx     # Formulario registro
│   │   └── LoginSuccess.tsx     # Pantalla post-login
│   │
│   ├── 🌐 api/
│   │   └── client.ts            # Cliente API fetch
│   │
│   ├── 🎨 components/
│   │   └── ProjectsList.tsx     # Ejemplo componente
│   │
│   └── 🖥️ server/
│       ├── index.ts             # Servidor Express
│       ├── db.ts                # Prisma config
│       └── routes/
│           ├── auth.ts          # /api/auth/*
│           ├── users.ts         # /api/users/*
│           ├── projects.ts      # /api/projects/*
│           ├── tasks.ts         # /api/tasks/*
│           └── user-stories.ts  # /api/user-stories/*
│
├── prisma/
│   ├── schema.prisma            # Modelos de BD
│   └── migrations/              # Historial de cambios
│       └── [timestamp]_init/    # Primera migración
│
├── anteriores_componentes/      # Componentes legacy (Deno/Fresh)
│   ├── components/
│   └── islands/
│
└── public/
    └── (assets estáticos)
```

---

## 🎯 Flujos de Trabajo

### Flujo 1: Primera Vez (Setup Inicial)

```
1. Leer: MIGRACIONES_COMPLETO.md
2. PostgreSQL corriendo
3. npm run migrate:dev
4. npm run dev:all
5. Registrarse → Login → ¡Éxito!
```

### Flujo 2: Cambiar Schema

```
1. Editar: prisma/schema.prisma
2. npm run migrate:dev
3. Nombre: describe_change
4. npm run dev:all
```

### Flujo 3: Reset Total

```
1. npm run migrate:reset
2. npm run migrate:dev
3. npm run dev:all
```

### Flujo 4: Deploy a Producción

```
1. npm run build
2. npm run migrate:prod
3. Deployed!
```

---

## 🔑 Puntos Clave

✅ **Migraciones**
- Crean tablas en PostgreSQL
- Se ejecutan UNA SOLA VEZ (Prisma previene duplicados)
- Después de cambiar schema, siempre migrar

✅ **Auth**
- Registro: POST /api/auth/register
- Login: POST /api/auth/login
- Logout: POST /api/auth/logout

✅ **Frontend**
- React Router para navegación
- /login, /register, /login-success
- localStorage para guardar sesión

✅ **Base de Datos**
- 15 modelos definidos
- Relaciones entre tablas
- Indexes para búsquedas rápidas

---

## 🚨 Errores Comunes

| Problema | Solución |
|----------|----------|
| "ECONNREFUSED" | PostgreSQL no corre |
| "Email ya existe" | Usa otro email |
| "Network Error" | Backend no inicia |
| "Cannot find module" | Importación incorrecta |
| "Database does not exist" | Crea la BD |

Ver **STEP_BY_STEP.md** para soluciones detalladas.

---

## 📞 Resumen Rápido

**3 pasos:**
```bash
npm run migrate:dev    # Tablas en BD
npm run dev:all        # App corriendo
# Accede http://localhost:3000
```

**¡Listo en 5 minutos!** ⚡

---

## 📝 Notas

- Documentación en español 🇪🇸
- Proyectado para React 19 + TypeScript + Prisma
- Backend con Express.js
- BD: PostgreSQL
- Estilos: Tailwind CSS

---

**Comienza con: `MIGRACIONES_COMPLETO.md` ⭐**

**Preguntas? Consulta los .md según el tema**

**Scripts automáticos? Usa `scripts/migrate.sh` o `scripts/migrate.bat`**
