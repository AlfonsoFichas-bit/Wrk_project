import type React from "react";
import WelcomeCard, {
	type WelcomeCardProps,
} from "../../components/welcome/WelcomeCard";
import DropdownMenu, { type DropdownMenuSection } from "../DropdownMenu";

/**
 * Props para el componente InteractiveWelcomeCard
 * Extiende las props de WelcomeCard y añade propiedades para el menú desplegable
 */
interface InteractiveWelcomeCardProps
	extends Omit<WelcomeCardProps, "rightElement"> {
	dropdownSections?: DropdownMenuSection[];
	dropdownButtonIcon?: React.ReactNode;
	dropdownButtonText?: string;
}

/**
 * Componente interactivo para mostrar una tarjeta de bienvenida con un menú desplegable
 * Este componente debe estar en la carpeta islands porque utiliza componentes interactivos
 */
export default function InteractiveWelcomeCard({
	title,
	description,
	icon,
	linkText,
	linkHref,
	bgColor,
	borderColor,
	textColor,
	dropdownSections,
	dropdownButtonIcon,
	dropdownButtonText = "Opciones",
}: InteractiveWelcomeCardProps) {
	// Renderizar el menú desplegable solo si hay secciones
	const dropdownMenu = dropdownSections ? (
		<DropdownMenu
			buttonText={dropdownButtonText}
			sections={dropdownSections}
			buttonIcon={dropdownButtonIcon}
			className="ml-2"
		/>
	) : undefined;

	// Usar el componente estático WelcomeCard y pasarle el menú desplegable como rightElement
	return (
		<WelcomeCard
			title={title}
			description={description}
			icon={icon}
			linkText={linkText}
			linkHref={linkHref}
			bgColor={bgColor}
			borderColor={borderColor}
			textColor={textColor}
			rightElement={dropdownMenu}
		/>
	);
}
