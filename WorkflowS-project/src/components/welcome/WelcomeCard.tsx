import type React from "react";

/**
 * Props para el componente WelcomeCard estático
 */
export interface WelcomeCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	linkText: string;
	linkHref: string;
	bgColor: string;
	borderColor: string;
	textColor: string;
	/** Elemento opcional para renderizar en la esquina inferior derecha */
	rightElement?: React.ReactNode;
}

/**
 * Componente estático para mostrar una tarjeta de bienvenida
 * Este componente no contiene lógica interactiva y puede ser usado en la carpeta components
 */
export default function WelcomeCard({
	title,
	description,
	icon,
	linkText,
	linkHref,
	bgColor,
	borderColor,
	textColor,
	rightElement,
}: WelcomeCardProps) {
	return (
		<div className={`${bgColor} p-5 rounded-lg border ${borderColor}`}>
			<div className="flex justify-between items-start mb-4">
				<div>
					<h3 className={`font-bold text-lg ${textColor}`}>{title}</h3>
					<p className="text-gray-600 mt-1">{description}</p>
				</div>
				{icon}
			</div>
			<div className="flex justify-between items-center">
				<a href={linkHref} className={`${textColor} hover:underline`}>
					{linkText} →
				</a>
				{rightElement}
			</div>
		</div>
	);
}
