import type React from "react";

interface AppContentProps {
	children: React.ReactNode;
	variant?: "header" | "sidebar";
}

export function AppContent({ children }: AppContentProps): React.ReactElement {
	return <div className="flex-1">{children}</div>;
}
