import { useSession } from "@/hooks/useSession";

export default function HeaderMenu() {
	const { loading, isAuthenticated, permissions } = useSession();

	// Determinar la URL de inicio según si el usuario está autenticado
	const homeUrl = isAuthenticated ? "/welcome" : "/";

	// Mostrar un indicador de carga mientras se verifica la sesión
	if (loading) {
		return (
			<nav>
				<ul className="flex space-x-6">
					<li>
						<a href="/" className="hover:underline">
							Inicio
						</a>
					</li>
				</ul>
			</nav>
		);
	}

	return (
		<nav>
			<ul className="flex space-x-6">
				<li>
					<a href={homeUrl} className="hover:underline">
						Inicio
					</a>
				</li>
				{isAuthenticated && (
					<>
						<li>
							<a href="/projects" className="hover:underline">
								Proyectos
							</a>
						</li>
						<li>
							<a href="/my-tasks" className="hover:underline">
								Mis Tareas
							</a>
						</li>
					</>
				)}
				{permissions.includes("view:backlog") && (
					<li>
						<a href="/backlog" className="hover:underline">
							Backlog
						</a>
					</li>
				)}
				{permissions.includes("manage:users") && (
					<li>
						<a href="/admin/users" className="hover:underline">
							Usuarios
						</a>
					</li>
				)}
				<li>
					<a href="/about" className="hover:underline">
						Acerca de
					</a>
				</li>
			</ul>
		</nav>
	);
}
