# Plan de Implementación de Componentes de anteriores_componentes/

Este documento detalla el plan para adaptar e integrar los componentes de la carpeta `anteriores_componentes/` al proyecto actual. Se organizan por categorías y se marcarán con checkboxes a medida que se completen.

## Categorías de Componentes

### 1. Componentes de Formulario (components/form/)
- [x] FormActions.tsx
- [x] FormError.tsx
- [x] FormField.tsx
- [x] FormSelect.tsx
- [x] FormTextarea.tsx

### 2. Componentes UI (components/ui/)
- [x] MaterialIcon.tsx
- [x] button.tsx
- [x] dropdown-menu.tsx
- [x] sidebar.tsx
- [x] icons/BookOpenIcon.tsx
- [x] icons/FolderIcon.tsx
- [x] icons/LayoutGridIcon.tsx
- [x] icons/PanelLeftIcon.tsx

### 3. Componentes de Bienvenida (components/welcome/)
- [x] QuickActionButton.tsx
- [x] WelcomeCard.tsx
- [x] WelcomeSection.tsx

### 4. Componentes Principales (components/)
- [x] AppContent.tsx
- [x] AppLogo.tsx
- [x] AppLogoIcon.tsx
- [x] AppShell.tsx
- [x] AppSidebar.tsx
- [x] AppSidebarHeader.tsx
- [x] AuthenticatedLayout.tsx
- [x] Button.tsx
- [x] Header.tsx
- [x] Icon.tsx
- [x] NavFooter.tsx
- [x] NavMain.tsx
- [x] NavUser.tsx
- [x] UserInfo.tsx
- [x] UserMenuContent.tsx

### 5. Islas de Chat (islands/Chat/)
- [ ] ChatApp.tsx
- [ ] ChatInterface.tsx
- [ ] ConversationList.tsx
- [ ] NewConversationModal.tsx

### 6. Islas de Evaluaciones (islands/Evaluations/)
- [ ] DeliverableDetails.tsx
- [ ] EvaluationCard.tsx
- [ ] EvaluationForm.tsx
- [ ] EvaluationHistory.tsx
- [ ] EvaluationManager.tsx
- [ ] EvaluationStats.tsx
- [ ] EvaluationView.tsx
- [ ] PendingDeliverablesList.tsx
- [ ] RubricSelector.tsx
- [ ] StudentEvaluationsList.tsx

### 7. Islas de Modales de Proyecto (islands/ProjectModals/)
- [ ] AssignProjectModal.tsx
- [ ] CreateProjectModal.tsx
- [ ] EditProjectModal.tsx

### 8. Islas de Proyectos (islands/Projects/)
- [ ] ProjectMembersList.tsx

### 9. Islas de Reportes (islands/Reports/)
- [ ] ReportGenerator.tsx
- [ ] ReportsList.tsx

### 10. Islas de Sprints (islands/Sprints/)
- [ ] AddUserStoriesToSprint.tsx
- [ ] CreateSprintForm.tsx
- [ ] CreateSprintPage.tsx
- [ ] EditSprintForm.tsx
- [ ] SprintCard.tsx
- [ ] SprintPlanningPage.tsx
- [ ] SprintsList.tsx
- [ ] SprintsOverview.tsx

### 11. Islas de Tareas (islands/Tasks/)
- [ ] TaskGrouping.tsx

### 12. Islas de Historias de Usuario (islands/UserStories/)
- [ ] CreateUserStoryForm.tsx
- [ ] EditUserStoryForm.tsx
- [ ] UserStoriesList.tsx
- [ ] UserStoryCard.tsx

### 13. Islas Adicionales (islands/)
- [ ] AdminCreateUserForm.tsx
- [ ] AdminUsersList.tsx
- [ ] AdminWelcomeOptions.tsx
- [ ] AppShell.tsx
- [x] AppShellExternal.tsx
- [ ] AppSidebar.tsx
- [x] AppSidebarExternal.tsx
- [ ] AssignProjectForm.tsx
- [ ] CommonWelcomeOptions.tsx
- [ ] CreateProjectForm.tsx
- [ ] DeleteProjectModal.tsx
- [ ] DropdownMenu.tsx
- [ ] EditProjectForm.tsx
- [ ] EmptyProjectsMessage.tsx
- [ ] HeaderMenu.tsx
- [x] HeaderNav.tsx
- [x] LoginForm.tsx (ya implementado)
- [x] LogoutButton.tsx
- [ ] Modal.tsx
- [x] NavFooter.tsx
- [x] NavFooterExternal.tsx
- [ ] NavMain.tsx
- [ ] NavUser.tsx
- [x] ProductOwnerWelcomeOptions.tsx
- [x] ProjectCard.tsx
- [ ] ProjectsHeader.tsx
- [ ] ProjectsList.tsx
- [ ] ProjectsStatusBar.tsx
- [x] RegisterForm.tsx (ya implementado)
- [x] ScrumMasterWelcomeOptions.tsx
- [ ] SidebarProvider.tsx
- [x] TeamDeveloperWelcomeOptions.tsx
- [x] UnauthorizedLogoutButton.tsx
- [x] UserInfoCard.tsx
- [x] WelcomeHeader.tsx
- [x] WelcomeScreen.tsx

## Pasos Generales por Componente
Para cada componente:
1. Leer el código fuente y entender su funcionalidad
2. Verificar importaciones y dependencias
3. Adaptar importaciones a la estructura actual (ej. cambiar rutas relativas)
4. Mover o copiar a la ubicación apropiada en `src/`
5. Verificar compatibilidad con Tailwind y otras dependencias
6. Ejecutar `npm run check` para asegurar no hay errores
7. Marcar como completado en este documento

## Notas Importantes
- Cuidado con conflictos de nombres (ej. AppShell.tsx existe en ambos lugares)
- Verificar que las importaciones de tipos y utilidades sean correctas
- Asegurar compatibilidad con la base de datos y lógica backend
- Mantener consistencia con el estilo de código existente