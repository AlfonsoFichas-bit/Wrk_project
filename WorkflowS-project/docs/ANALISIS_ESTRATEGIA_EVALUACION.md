# Análisis de Estrategia de Evaluación y Alineación Metodológica

**Fecha:** 20 de Octubre 2023
**Autor:** Jules (Ingeniero de Software y Metodólogo)
**Asunto:** Confirmación de Evaluación por Tareas y Recomendaciones de Ajuste

## 1. Resumen Ejecutivo

Este documento responde a la consulta sobre la granularidad de las evaluaciones en la plataforma "WorkflowS". Tras un análisis exhaustivo del código fuente (Backend, Frontend y Base de Datos), **se confirma que el sistema está configurado actualmente para evaluar Tareas Individuales**.

Esta configuración presenta una discrepancia con el enfoque académico estándar de Scrum, donde la evaluación suele centrarse en incrementos de valor (Sprints) o productos finales, en lugar del micro-trabajo diario (Tareas).

## 2. Evidencia Técnica (Situación Actual)

El sistema soporta técnica y funcionalmente la evaluación de tareas unitarias.

### 2.1 Base de Datos (Prisma Schema)
La entidad `Evaluation` mantiene una relación directa con `Task`:
```prisma
model Evaluation {
  id          String   @id @default(cuid())
  taskId      String?  // Relación directa
  ...
}
```
Esto permite que cada tarea tenga su propia nota independiente.

### 2.2 API REST
Existe un endpoint dedicado exclusivamente a este fin:
- **POST** `/api/tasks/:id/evaluate`: Recibe calificación y feedback para una tarea específica.

### 2.3 Interfaz de Usuario (Frontend)
El flujo actual de la vista "Evaluaciones" (`Evaluations.tsx`) está diseñado para este micromanagement:
1.  **Filtro:** Muestra al docente una lista de "Pendientes de Revisión" basada en tareas con estado `COMPLETED`.
2.  **Acción:** Provee un botón "Ir a Calificar" que lleva a un formulario de evaluación específico para esa tarea.

## 3. Análisis Metodológico y de Impacto

### 3.1 Carga Cognitiva y Administrativa (El Problema)
Evaluar tareas introduce una carga de trabajo exponencial para el docente (rol ADMIN).

*   **Escenario:** Un proyecto semestral típico con 4 estudiantes.
*   **Volumen de Tareas:** 4 Sprints x 5 Historias/Sprint x 3 Tareas/Historia = **60 Tareas**.
*   **Impacto:** El docente tendría que abrir, revisar y calificar **60 formularios individuales** por equipo. Si tiene 5 equipos, son **300 evaluaciones**.
*   **Riesgo:** Fatiga del evaluador, evaluaciones superficiales y retrasos en el feedback.

### 3.2 Perspectiva Scrum Académico
En Scrum, la tarea es una unidad de trabajo para el equipo (Developers), no una unidad de entrega de valor para el cliente (Docente).
*   **La Tarea:** Es técnica (ej. "Configurar base de datos"). No siempre tiene un "entregable" visible por sí sola.
*   **La Historia de Usuario / Sprint:** Es funcional (ej. "Como usuario quiero loguearme"). Esto es lo que el docente debería validar.

## 4. Opciones de Decisión

Para proceder, se presentan tres caminos estratégicos:

### Opción A: Mantener Evaluación por Tareas (Status Quo)
*   **Descripción:** No se realizan cambios. El docente evalúa cada tarea pequeña.
*   **Pros:** Control absoluto sobre el aporte de cada estudiante.
*   **Contras:** Carga administrativa insostenible. No alinea con la filosofía ágil de "valor sobre burocracia".
*   **Recomendación:** Solo viable si el curso es de "Micro-programación" y son muy pocos alumnos.

### Opción B: Evaluación Híbrida (Formativa vs Sumativa)
*   **Descripción:** Se mantiene la funcionalidad de tareas pero se marca como "Revisión Rápida" (sin nota o binaria Aprobado/Rechazado) y la Nota Real se asigna al cerrar el Sprint.
*   **Pros:** Permite monitoreo continuo sin obligar a poner una nota decimal a todo.
*   **Contras:** Requiere cambios complejos en la lógica de cálculo de promedios.

### Opción C: Transición a Evaluación por Sprints (Recomendada)
*   **Descripción:** Desactivar la evaluación de tareas y habilitar/fortalecer la evaluación de Sprints (`GET /api/evaluations?sprintId=...`).
*   **Acciones Técnicas:**
    1.  Ocultar botón "Calificar" en tareas.
    2.  Crear vista de "Calificación de Sprint" donde se vea el resumen de historias completadas.
    3.  La nota del Sprint se asigna a todos los miembros o ponderada por participación.
*   **Pros:** Reduce las evaluaciones de 60 a 4 por equipo. Fomenta el trabajo en equipo. Alinear con "Entregables".

## 5. Conclusión

La plataforma **SÍ** tiene evaluaciones por tareas. Se recomienda encarecidamente migrar hacia la **Opción C** para asegurar la viabilidad operativa del curso y la fidelidad metodológica.

Quedo a la espera de su directriz para proceder con los ajustes técnicos pertinentes.
