import { useSession } from "@/hooks/useSession";
import AdminWelcomeOptions from "@/islands/AdminWelcomeOptions";
import WelcomeHeader from "@/islands/WelcomeHeader";

export default function TeacherDashboard() {
	const { session } = useSession();

	if (!session) return null;

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			<WelcomeHeader username={session.name} />

			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div className="mb-6">
					<h2 className="text-xl font-bold text-gray-900">Panel de Docente</h2>
					<p className="text-gray-500">
						Gestiona los proyectos académicos, usuarios y evaluaciones del
						curso.
					</p>
				</div>
				<AdminWelcomeOptions />
			</div>
		</div>
	);
}
