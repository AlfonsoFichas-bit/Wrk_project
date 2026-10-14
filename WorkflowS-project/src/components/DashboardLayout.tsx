import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { AppShell } from "./AppShell";
import { ChatWidget } from "./ChatWidget";

export const DashboardLayout = () => {
	const { session, isAuthenticated, loading } = useSession();

	if (loading)
		return (
			<div className="flex min-h-screen items-center justify-center">
				Cargando...
			</div>
		);

	if (!isAuthenticated) return <Navigate to="/login" replace />;

	// Adapt session user to AppShell's expected user type
	const userForShell = session
		? {
				id: session.id,
				name: session.name,
				email: session.email,
				role: session.role,
			}
		: undefined;

	return (
		<>
			<AppShell user={userForShell}>
				<Outlet />
			</AppShell>
			<ChatWidget />
		</>
	);
};
