import type React from "react";
import { useSession } from "@/hooks/useSession";
import { DropdownMenuItem } from "./ui/dropdown-menu";

interface User {
	username: string;
	email: string;
}

interface UserMenuContentProps {
	user: User;
}

export function UserMenuContent({
	user,
}: UserMenuContentProps): React.ReactElement {
	const { logout } = useSession();

	const handleLogout = (e: React.MouseEvent) => {
		e.preventDefault();
		logout();
	};

	return (
		<div className="p-2">
			<div className="mb-2 p-2">
				<p className="text-sm font-medium">{user.username}</p>
				<p className="text-xs text-gray-500">{user.email}</p>
			</div>
			<DropdownMenuItem>
				<a href="/profile" className="flex w-full items-center">
					Mi Perfil
				</a>
			</DropdownMenuItem>
			<DropdownMenuItem>
				<a href="/settings" className="flex w-full items-center">
					Configuración
				</a>
			</DropdownMenuItem>
			<div className="my-1 h-px bg-gray-200" />
			<DropdownMenuItem>
				<button
					type="button"
					onClick={handleLogout}
					className="flex w-full items-center text-red-600"
				>
					Cerrar Sesión
				</button>
			</DropdownMenuItem>
		</div>
	);
}
