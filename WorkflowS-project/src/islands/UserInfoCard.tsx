import { UserRole } from "@/models/user";

interface UserInfoCardProps {
	username: string;
	email: string;
	role: UserRole;
}

export default function UserInfoCard({
	username,
	email,
	role,
}: UserInfoCardProps) {
	// Get role display name
	const getRoleDisplay = (role: UserRole) => {
		switch (role) {
			case UserRole.ADMIN:
				return "Administrador";
			case UserRole.SCRUM_MASTER:
				return "Scrum Master";
			case UserRole.PRODUCT_OWNER:
				return "Product Owner";
			case UserRole.TEAM_DEVELOPER:
				return "Desarrollador de Equipo";
			default:
				return role;
		}
	};

	return (
		<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
			<h2 className="text-lg font-semibold text-blue-800 mb-2">
				Información de tu cuenta
			</h2>
			<ul className="space-y-2 text-gray-700">
				<li>
					<strong>Nombre de usuario:</strong> {username}
				</li>
				<li>
					<strong>Correo electrónico:</strong> {email}
				</li>
				<li>
					<strong>Rol:</strong> {getRoleDisplay(role)}
				</li>
			</ul>
		</div>
	);
}
