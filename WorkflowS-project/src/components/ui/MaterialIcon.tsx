interface MaterialIconProps {
	icon: string;
	fill?: 0 | 1;
	weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
	grade?: -25 | 0 | 200;
	opticalSize?: 20 | 24 | 40 | 48;
	size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
	className?: string;
	style?: React.CSSProperties;
}

export function MaterialIcon({
	icon,
	fill = 0,
	weight = 400,
	grade = 0,
	opticalSize = 24,
	size = "md",
	className = "",
	style = {},
}: MaterialIconProps) {
	// Mapeo de tamaños a clases de Tailwind
	const sizeClasses = {
		sm: "text-sm",
		md: "text-base",
		lg: "text-lg",
		xl: "text-xl",
		"2xl": "text-2xl",
		"3xl": "text-3xl",
	};

	// Estilo para los ejes de la fuente variable
	const fontStyle = {
		...style,
		fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
	};

	return (
		<span
			className={`material-symbols-outlined ${sizeClasses[size]} ${className}`}
			style={fontStyle}
		>
			{icon}
		</span>
	);
}
