import type React from "react";
import { SidebarGroup, SidebarMenu } from "../components/ui/sidebar";

interface NavFooterProps {
	className?: string;
}

export default function NavFooterExternal({
	className = "",
}: NavFooterProps): React.ReactElement {
	// Se han eliminado las opciones de Documentación, Repositorio y Ayuda
	return (
		<SidebarGroup className={`px-2 py-0 ${className}`}>
			<SidebarMenu>{/* No hay elementos en el footer */}</SidebarMenu>
		</SidebarGroup>
	);
}
