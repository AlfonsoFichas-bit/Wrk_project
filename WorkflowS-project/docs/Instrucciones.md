Especificaciones Funcionales y Requisitos de "WorkflowS"

1. Objetivo General

Desarrollar una plataforma web para la gestión de proyectos académicos bajo la metodología Scrum, que centralice la información y facilite el seguimiento y la evaluación objetiva del progreso del equipo.

1.1 Objetivos Específicos
- Analizar los procesos actuales para el seguimiento de proyectos en la Universidad La Salle para definir los requisitos funcionales y no funcionales de la plataforma.
- Diseñar los workflows para las fases de la gestión de proyectos con el fin de planificar, controlar y automatizar procesos importantes.
- Desarrollar el sistema de gestión de proyectos en base a la metodología Scrum, permitiendo una gestión colaborativa y un seguimiento oportuno en cada fase del proceso.
- Validar el sistema de gestión para la verificación de su correcto funcionamiento mediante casos de prueba integrales.

2. Roles y Actores del Sistema

El sistema debe gestionar los siguientes perfiles con permisos diferenciados :

    Docente / Administrador: Configura proyectos, define rúbricas, valida entregables y accede a métricas globales.

    Estudiante (Equipo Scrum):

        Product Owner: Gestiona y prioriza el backlog (historias de usuario).

        Scrum Master: Gestiona el ciclo de vida de los Sprints y facilita el proceso.

        Team Developer: Ejecuta las tareas técnicas y actualiza estados.

3. Requisitos Funcionales (Módulos)

3.1 Gestión de Identidad y Usuarios

    Registro e inicio de sesión seguro.

Creación, modificación y eliminación de usuarios.

Asignación de roles a nivel de sistema y a nivel de proyecto.

3.2 Gestión de Proyectos

    Crear proyectos definiendo nombre, descripción y fechas de inicio/fin.

Asignar estudiantes a proyectos con roles específicos (Scrum Master, PO, Dev).

3.3 Gestión del Alcance (Historias de Usuario)

    Crear, modificar y eliminar Historias de Usuario.

Definir Criterios de Aceptación para cada historia.

Priorizar historias (ej. Alta, Media, Baja) mediante un sistema de ordenamiento (arrastre).

3.4 Gestión de Sprints (Ciclos)

    Crear Sprints con fechas de inicio y fin (validando que estén dentro del rango del proyecto).

Asignar Historias de Usuario del Backlog a un Sprint específico.

Estados del Sprint: Planificación, Activo, Completado.

3.5 Gestión de Tareas y Kanban

    Desglosar Historias de Usuario en Tareas específicas.

Asignar tareas a miembros del equipo.

Tablero Kanban: Visualización de tareas en columnas (Pendiente, En Progreso, Completada) con funcionalidad de arrastrar y soltar para actualizar estados.

3.6 Evaluación y Calificación

    Crear Rúbricas de evaluación personalizadas por proyecto.

Asignar calificaciones a entregables por Sprint o Proyecto.

Proporcionar retroalimentación (feedback) detallada al estudiante.

3.7 Métricas y Reportes

    Generar gráficos de Burndown para ver el progreso del Sprint.

Métricas de velocidad del equipo y contribución individual.

Exportación de datos (calificaciones, reportes) en formatos estándar (PDF, Excel).

3.8 Comunicación y Documentación

    Sistema de mensajería interna o comentarios en tareas.

Sistema de notificaciones configurables (asignaciones, fechas límite, notas).

Gestión documental: Carga/descarga de archivos, organización en carpetas e historial de versiones .

Calendario de eventos sincronizado con fechas de Sprints y entregas.

4. Product Backlog (Historias de Usuario a Cumplir)

Debes asegurar el cumplimiento de las siguientes 14 Historias de Usuario (HU) definidas en el alcance:

ID	Rol	Funcionalidad Principal	Prioridad
HU-01	Docente	Gestionar usuarios y asignar roles	Alta
HU-02	Docente	Crear proyectos y asignar estudiantes	Alta
HU-03	Product Owner	Priorizar historias de usuario y criterios de aceptación	Alta
HU-04	Scrum Master	Planificar Sprints con fechas definidas	Alta
HU-05	Team Dev	Gestionar estado de tareas	Media
HU-06	Miembro	Visualizar y mover tareas en Tablero Kanban	Media
HU-07	Docente	Evaluar entregables mediante rúbricas	Media
HU-08	Docente	Ver métricas y gráficos Burndown	Baja
HU-09	Todos	Recibir notificaciones de cambios	Baja
HU-10	Todos	Dashboard personalizado por rol	Baja
HU-11	Miembro	Carga y descarga de documentos (con versiones)	Media
HU-12	Miembro	Comunicación interna (chat/comentarios)	Media
HU-13	Todos	Calendario de eventos	Baja
HU-14	Docente	Exportación de datos	Baja

5. Flujos de Trabajo (Workflows)

La plataforma debe soportar lógicamente los siguientes procesos :

    Inicialización: El Docente crea el proyecto y conforma los equipos.

    Planificación (Sprint Planning):

        El Product Owner llena el Backlog.

        El Scrum Master crea el Sprint y selecciona qué historias entran.

    Ejecución (Daily/Development):

        Los Developers crean tareas dentro de las historias.

        Mueven las tareas en el Kanban (Pendiente -> En Progreso -> Completado).

    Cierre y Control:

        El estudiante sube evidencias/entregables.

        El sistema notifica "Entrega recibida".

        El docente evalúa usando la rúbrica y el sistema calcula la nota.

6. Requisitos No Funcionales

Características de calidad que el sistema debe tener :

    Usabilidad: Interfaz intuitiva para usuarios sin experiencia previa en Scrum.

    Accesibilidad: Diseño responsivo (móvil y escritorio).

    Seguridad: Autenticación segura y control de acceso estricto basado en roles.

    Rendimiento: Tiempos de respuesta rápidos (menos de 2 segundos en operaciones comunes).

    Escalabilidad: Capacidad de soportar múltiples proyectos y usuarios simultáneos.

    Mantenibilidad: Código modular.

    Interoperabilidad: Capacidad de importar/exportar datos.
