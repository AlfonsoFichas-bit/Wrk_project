import type React from "react";

interface IconProps {
	iconNode: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	className?: string;
}

export function Icon({ iconNode: IconComponent, className = "" }: IconProps) {
	return <IconComponent className={className} />;
}
