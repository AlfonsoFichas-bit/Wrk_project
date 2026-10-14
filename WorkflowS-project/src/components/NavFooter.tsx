import type React from "react";
import { SidebarGroup, SidebarMenu } from "./ui/sidebar";

interface NavFooterProps {
	className?: string;
}

export function NavFooter({
	className = "",
}: NavFooterProps): React.ReactElement {
	// Se han eliminado las opciones de Documentación y Repositorio
	return (
		<SidebarGroup className={`px-2 py-0 ${className}`}>
			<SidebarMenu>{/* No hay elementos en el footer */}</SidebarMenu>
		</SidebarGroup>
	);
}
