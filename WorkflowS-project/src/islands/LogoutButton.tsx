import { useSession } from "@/hooks/useSession";

export default function LogoutButton() {
	const { logout } = useSession();

	const handleLogout = (e: React.MouseEvent) => {
		e.preventDefault();
		logout();
	};

	return (
		<div className="mt-8 text-center">
			<button
				type="button"
				onClick={handleLogout}
				className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
			>
				Cerrar Sesión
			</button>
		</div>
	);
}
