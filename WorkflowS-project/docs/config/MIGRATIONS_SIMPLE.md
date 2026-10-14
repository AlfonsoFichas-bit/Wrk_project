# ⚡ PARA HACER MIGRACIONES - Respuesta Directa

## El comando que necesitas:

```bash
npm run migrate:dev
```

Eso es. Un comando. Aquí está el paso a paso:

---

## PASO 1: Abre terminal

```bash
cd /home/buga/TGZ/prueba/WorkflowS-project
```

---

## PASO 2: PostgreSQL está corriendo?

**Si usas Docker:**
```bash
docker run -d --name postgres-workflows \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=workflow_db \
  -p 5432:5432 \
  postgres:latest
```

**Si está instalado:**
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
net start PostgreSQL-x64-13
```

---

## PASO 3: Ejecuta migraciones

```bash
npm run migrate:dev
```

---

## PASO 4: Responde la pregunta

Verás:
```
? Enter a name for the new migration: › _
```

**Escribe:** `init`

O solo presiona **Enter**

---

## RESULTADO:

```
✔ Created migration: ./prisma/migrations/20240119_init/migration.sql
✔ Database synchronized with schema
✔ Generated Prisma Client
✨ Done in 3.21s
```

**¡LAS TABLAS ESTÁN CREADAS!**

---

## PASO 5: Ver las tablas (opcional)

```bash
npm run prisma:studio
```

Abre http://localhost:5555 para ver todas las tablas.

---

## PASO 6: Iniciar app

```bash
npm run dev:all
```

Accede a http://localhost:3000

---

## 📝 Resumen en 1 línea:

```bash
# PostgreSQL corriendo → npm run migrate:dev → Hecho!
```

---

## ❌ Si PostgreSQL no está corriendo:

Verás error:
```
Error: Client was closed
connect ECONNREFUSED 127.0.0.1:5432
```

**Solución:**
```bash
# Docker
docker start postgres-workflows

# O instálalo:
docker run -d --name postgres-workflows \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=workflow_db \
  -p 5432:5432 \
  postgres:latest
```

Luego repite:
```bash
npm run migrate:dev
```

---

## ✅ Eso es todo para migraciones

**Próximo paso: `npm run dev:all` para iniciar la app**

Ver: `MIGRACIONES_COMPLETO.md` para más detalles.
