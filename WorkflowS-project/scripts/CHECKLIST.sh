#!/bin/bash
# Visualizador de checklist - ejecutable

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║         🚀 CHECKLIST DE SETUP - WorkflowS                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════

📋 FASE 1: PREPARACIÓN (Solo una vez)

  [ ] 1. PostgreSQL instalado
        ✓ Docker:   docker --version
        ✓ Local:    psql --version

  [ ] 2. Node.js instalado
        ✓ node --version (v18+)
        ✓ npm --version

  [ ] 3. Dependencias instaladas
        ✓ npm install (completado)

  [ ] 4. Variables de entorno
        ✓ .env existe
        ✓ DATABASE_URL configurada
        ✓ API_PORT configurado

═══════════════════════════════════════════════════════════════

🗂️  FASE 2: MIGRACIONES

  [ ] 1. PostgreSQL corriendo
        ✓ docker start postgres-workflows
        ✓ brew services start postgresql
        ✓ sudo systemctl start postgresql

  [ ] 2. Base de datos creada
        ✓ psql -U postgres -l (verificar workflow_db)

  [ ] 3. Ejecutar migraciones
        ✓ npm run migrate:dev
        ✓ Responder: init (o Enter)
        ✓ Mensaje: "✔ Database synchronized"

  [ ] 4. Verificar tablas
        ✓ npm run prisma:studio
        ✓ Abrir http://localhost:5555
        ✓ Ver todas las tablas: users, projects, tasks, etc

═══════════════════════════════════════════════════════════════

▶️  FASE 3: EJECUTAR APLICACIÓN

  [ ] 1. Iniciar backend + frontend
        ✓ npm run dev:all
        ✓ Esperar: "Frontend: http://localhost:3000"
        ✓ Esperar: "Backend: http://localhost:5000"

  [ ] 2. Abrir navegador
        ✓ http://localhost:3000
        ✓ Ves formulario de LOGIN

═══════════════════════════════════════════════════════════════

📝 FASE 4: AUTENTICACIÓN

  [ ] 1. Registrarse
        ✓ Click: "Regístrate aquí"
        ✓ Nombre:      Juan Pérez
        ✓ Email:       juan@example.com
        ✓ Contraseña:  Test123456 (mínimo 6)
        ✓ Confirmar:   Test123456
        ✓ Rol:         Desarrollador
        ✓ Click: "Registrarse"
        ✓ Mensaje: "✓ Registro Exitoso"

  [ ] 2. Iniciar sesión
        ✓ Email:       juan@example.com
        ✓ Contraseña:  Test123456
        ✓ Click: "Iniciar Sesión"

  [ ] 3. Pantalla de éxito
        ✓ Ves: "¡Bienvenido!"
        ✓ Nombre: Juan Pérez
        ✓ Correo: juan@example.com
        ✓ Rol: Desarrollador

  [ ] 4. Acciones posteriores
        ✓ Click: "Ir a Proyectos" (ir a /projects)
        ✓ Click: "Cerrar Sesión" (limpiar localStorage)

═══════════════════════════════════════════════════════════════

🎯 VERIFICACIONES FINALES

  [ ] Base de datos
        ✓ Tabla users tiene 1+ registro
        ✓ Password está hasheada (no en texto plano)
        ✓ Email es único

  [ ] API Endpoints
        ✓ POST /api/auth/register  (200)
        ✓ POST /api/auth/login     (200)
        ✓ GET  /api/health         (200)

  [ ] Frontend
        ✓ React Router funciona
        ✓ Componentes cargan
        ✓ Tailwind CSS aplicado
        ✓ Validación en formularios

  [ ] Almacenamiento
        ✓ localStorage["user"] existe después de login
        ✓ Se limpia al logout

═══════════════════════════════════════════════════════════════

⚡ COMANDOS RÁPIDOS

npm run migrate:dev      →  Crear migraciones
npm run dev:all          →  Frontend + Backend
npm run dev:server       →  Solo backend
npm run dev              →  Solo frontend
npm run prisma:studio    →  Ver BD (http://localhost:5555)
npm run format           →  Formatear código
npm run check            →  Verificar errores

═══════════════════════════════════════════════════════════════

❌ SI ALGO FALLA

  Database Error?
    docker start postgres-workflows
    psql -U postgres -d workflow_db -c "\dt"

  Migration Error?
    npx prisma migrate reset
    npm run migrate:dev

  Frontend Error?
    npm install
    npm run format

  Backend Error?
    npm install
    npm run dev:server

═══════════════════════════════════════════════════════════════

✅ ESTADO FINAL ESPERADO

  ✓ PostgreSQL corriendo
  ✓ Tablas creadas (15 modelos)
  ✓ Frontend en http://localhost:3000
  ✓ Backend en http://localhost:5000
  ✓ Puedes registrarte
  ✓ Puedes loggearte
  ✓ Ves pantalla de bienvenida
  ✓ Datos en localStorage
  ✓ Puedes hacer logout

═══════════════════════════════════════════════════════════════

📚 DOCUMENTACIÓN

  MIGRACIONES_COMPLETO.md    ← Lee primero
  STEP_BY_STEP.md            ← Pasos exactos
  QUICK_START.md             ← Resumen 5 min
  AUTHENTICATION_SUMMARY.md  ← Resumen técnico
  IMPORTS_GUIDE.md           ← Importaciones
  README_ES.md               ← Índice completo

═══════════════════════════════════════════════════════════════

🎉 ¡LISTO PARA COMENZAR!

EOF

echo ""
echo "Para empezar:"
echo "  1. npm run migrate:dev"
echo "  2. npm run dev:all"
echo "  3. Accede a http://localhost:3000"
echo ""
