import type React from "react";
import SidebarProvider from "./SidebarProvider";

interface AppShellProps {
	children: React.ReactNode;
	variant?: "header" | "sidebar";
}

export default function AppShellExternal({
	children,
	variant = "header",
}: AppShellProps): React.ReactElement {
	// En un entorno real, podrías obtener este valor de una cookie o estado global
	const isOpen = true;

	if (variant === "header") {
		return <div className="flex min-h-screen w-full flex-col">{children}</div>;
	}

	return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
