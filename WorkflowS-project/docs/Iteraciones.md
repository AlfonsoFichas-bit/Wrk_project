# Planificación del Proyecto

## Desarrollo

### Iteración 1: Gestión de Identidad y Alcance (HU-01, HU-02, HU-03)

*   **Planificación**
    *   Tareas Técnicas (Scrum + XP):
        1.  Configuración del entorno de desarrollo y repositorio (Git).
        2.  Definición y estimación de HU-01, HU-02, HU-03.
        3.  Configuración del motor de Base de Datos y ORM.
    *   Entregables:
        *   Stack Tecnológico Configurado.
        *   Backlog de la Iteración.
*   **Diseño**
    *   Tareas Técnicas (Scrum + XP):
        1.  Modelado E-R: Entidades Usuario, Rol, Proyecto e Historia de Usuario.
        2.  Diseño de Diagramas de Secuencia para Autenticación y Creación de Proyectos.
        3.  Prototipado de alta fidelidad (UI) para módulos de administración.
    *   Entregables:
        *   Esquema de Base de Datos (v1).
        *   Mockups de Gestión de Usuarios/Proyectos.
*   **Codificación**
    *   Tareas Técnicas (Scrum + XP):
        1.  Implementación de API REST: Auth (JWT), Users, Projects, Stories.
        2.  Desarrollo Frontend: Vistas de Login, Dashboard Admin y Backlog.
        3.  Refactorización preliminar de componentes reutilizables.
    *   Entregables:
        *   Módulo de Seguridad y Usuarios.
        *   Módulo de Gestión de Proyectos y Backlog.
*   **Pruebas**
    *   Tareas Técnicas (Scrum + XP):
        1.  Pruebas Unitarias (Jest/Vitest) para validación de roles y seguridad.
        2.  Pruebas de Integración: Flujo de creación de historias.
        3.  Pruebas de aceptación con el Product Owner (Simulado).
    *   Entregables:
        *   Reporte de cobertura de pruebas.
        *   Código fuente estable (Release 1.0).

### Iteración 2: El Núcleo de Scrum (Sprints y Kanban) (HU-04, HU-05, HU-06)

*   **Planificación**
    *   Tareas Técnicas (Scrum + XP):
        1.  Selección y estimación de HU-04, HU-05, HU-06.
        2.  Desglose de tareas técnicas para la interactividad del tablero.
    *   Entregables:
        *   Plan de Iteración 2.
        *   Fichas de tareas técnicas.
*   **Diseño**
    *   Tareas Técnicas (Scrum + XP):
        1.  Modelado E-R: Relación Sprint - Historia - Tarea.
        2.  Diseño de Diagrama de Estados para el ciclo de vida de una Tarea.
        3.  Diseño UX del Tablero Kanban (Interacción Drag & Drop).
    *   Entregables:
        *   Diagrama de Estados de Tareas.
        *   Prototipo de Tablero Kanban interactivo.
*   **Codificación**
    *   Tareas Técnicas (Scrum + XP):
        1.  Backend: Endpoints para gestión de Sprints y Tareas.
        2.  Frontend: Implementación de lógica de Drag & Drop para el Kanban.
        3.  Lógica de asignación de tareas a miembros del equipo.
    *   Entregables:
        *   API de Sprints y Tareas.
        *   Tablero Kanban Funcional.
*   **Pruebas**
    *   Tareas Técnicas (Scrum + XP):
        1.  Pruebas Unitarias: Validación de fechas de Sprints y estados de tareas.
        2.  Pruebas de Interfaz: Verificación de persistencia al mover tarjetas en Kanban.
    *   Entregables:
        *   Reporte de pruebas de interfaz.
        *   Release 2.0 (Gestión de Trabajo).

### Iteración 3: Métricas y Experiencia de Usuario (HU-08, HU-09, HU-10)

*   **Planificación**
    *   Tareas Técnicas (Scrum + XP):
        1.  Análisis de algoritmos para cálculo de Burndown Chart.
        2.  Definición de eventos disparadores para notificaciones.
    *   Entregables:
        *   Definición de métricas.
        *   Plan de Iteración 3.
*   **Diseño**
    *   Tareas Técnicas (Scrum + XP):
        1.  Diseño de Arquitectura para el sistema de Notificaciones (Observer Pattern).
        2.  Diseño de componentes visuales para Gráficos (Dashboard).
    *   Entregables:
        *   Diseño de arquitectura de notificaciones.
        *   Bocetos de Dashboard por Rol.
*   **Codificación**
    *   Tareas Técnicas (Scrum + XP):
        1.  Implementación de servicios de cálculo de velocidad y progreso.
        2.  Integración de librería de gráficos (ej. Chart.js/Recharts).
        3.  Desarrollo del centro de notificaciones y Dashboard personalizado.
    *   Entregables:
        *   Módulo de Reportes y Gráficos.
        *   Sistema de Notificaciones.
*   **Pruebas**
    *   Tareas Técnicas (Scrum + XP):
        1.  Validación de cálculos matemáticos en reportes (Pruebas de caja blanca).
        2.  Verificación de disparadores de notificaciones en tiempo real/diferido.
    *   Entregables:
        *   Reporte de exactitud de métricas.
        *   Release 3.0 (Control y Seguimiento).

### Iteración 4: Evaluación Académica y Colaboración (HU-07, HU-11, HU-12, HU-13)

*   **Planificación**
    *   Tareas Técnicas (Scrum + XP):
        1.  Estimación de complejidad para el módulo de Rúbricas Dinámicas.
        2.  Análisis de requisitos para almacenamiento de archivos.
    *   Entregables:
        *   Plan de Iteración 4.
*   **Diseño**
    *   Tareas Técnicas (Scrum + XP):
        1.  Modelado de datos complejo: Rúbrica -> Criterio -> Nivel.
        2.  Diseño de flujo de carga de evidencias y comentarios (Chat).
    *   Entregables:
        *   Modelo de datos de Evaluación.
        *   Diagramas de Interacción (Chat/Archivos).
*   **Codificación**
    *   Tareas Técnicas (Scrum + XP):
        1.  Backend: Lógica de evaluación y cálculo de notas basado en rúbricas.
        2.  Implementación de servicio de almacenamiento (Storage) para documentos.
        3.  Desarrollo de chat contextual en tareas y vista de Calendario.
    *   Entregables:
        *   Módulo de Evaluación y Rúbricas.
        *   Módulo de Gestión Documental y Colaboración.
*   **Pruebas**
    *   Tareas Técnicas (Scrum + XP):
        1.  Pruebas de carga de archivos (formatos y pesos límites).
        2.  Pruebas de integración: Flujo completo Entrega -> Evaluación -> Calificación.
    *   Entregables:
        *   Reporte de pruebas de integración.
        *   Release 4.0 (Académico y Colaborativo).

### Iteración 5: Cierre, Exportación y Despliegue (HU-14)

*   **Planificación**
    *   Tareas Técnicas (Scrum + XP):
        1.  Definición de formatos de reporte oficial (PDF/Excel).
        2.  Planificación del despliegue final y limpieza de código.
    *   Entregables:
        *   Plan de Iteración Final.
*   **Diseño**
    *   Tareas Técnicas (Scrum + XP):
        1.  Diseño de plantillas (Templates) para reportes PDF.
        2.  Diseño de arquitectura de despliegue (Production Environment).
    *   Entregables:
        *   Plantillas de Reportes.
        *   Documentación de Despliegue.
*   **Codificación**
    *   Tareas Técnicas (Scrum + XP):
        1.  Implementación de generación de documentos PDF/Excel desde el backend.
        2.  Refactorización Final: Optimización de consultas y limpieza de código muerto.
        3.  Configuración de variables de entorno para producción.
    *   Entregables:
        *   Módulo de Exportación.
        *   Versión Final del Sistema (Golden Release).
*   **Pruebas**
    *   Tareas Técnicas (Scrum + XP):
        1.  Pruebas de Sistema: Validación de flujos completos (End-to-End).
        2.  Pruebas de Usabilidad y corrección de estilos finales.
    *   Entregables:
        *   Reporte Final de Calidad.
        *   Manual de Usuario y Técnico.