import type React from "react";
import { useEffect, useRef, useState } from "react";

export interface DropdownMenuItem {
	label: string;
	href?: string;
	onClick?: () => void;
	isDanger?: boolean;
}

export interface DropdownMenuSection {
	items: DropdownMenuItem[];
}

interface DropdownMenuProps {
	buttonText: string;
	sections: DropdownMenuSection[];
	buttonIcon?: React.ReactNode;
	align?: "left" | "right";
	className?: string;
}

export default function DropdownMenu({
	buttonText,
	sections,
	buttonIcon,
	align = "right",
	className = "",
}: DropdownMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Cerrar el menú cuando se hace clic fuera de él
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Cerrar el menú cuando se presiona la tecla Escape
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, []);

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	const handleItemClick = (item: DropdownMenuItem) => {
		if (item.onClick) {
			item.onClick();
		}
		setIsOpen(false);
	};

	return (
		<div className={`relative inline-flex ${className}`} ref={dropdownRef}>
			<span className="inline-flex divide-x divide-gray-300 overflow-hidden rounded border border-gray-300 bg-white shadow-sm">
				<button
					type="button"
					className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:relative"
					onClick={toggleDropdown}
				>
					{buttonText}
				</button>

				<button
					type="button"
					className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:relative"
					aria-label="Menu"
					onClick={toggleDropdown}
				>
					{buttonIcon || (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="1.5"
							stroke="currentColor"
							className="w-4 h-4"
							aria-hidden="true"
						>
							<title>Icono de menú</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m19.5 8.25-7.5 7.5-7.5-7.5"
							/>
						</svg>
					)}
				</button>
			</span>

			{isOpen && (
				<div
					role="menu"
					className={`absolute ${align === "right" ? "right-0" : "left-0"} top-12 z-50 w-56 divide-y divide-gray-200 overflow-hidden rounded border border-gray-300 bg-white shadow-sm`}
				>
					{sections.map((section, sectionIndex) => (
						<div key={`section-${sectionIndex}-${Date.now()}`}>
							{section.items.map((item) =>
								item.href ? (
									<a
										key={`${item.href}-${item.label}`}
										href={item.href}
										className={`block px-3 py-2 text-sm font-medium ${
											item.isDanger
												? "text-red-700 hover:bg-red-50"
												: "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
										} transition-colors`}
										role="menuitem"
										onClick={() => handleItemClick(item)}
									>
										{item.label}
									</a>
								) : (
									<button
										key={`${item.label}-${Date.now()}-${Math.random()}`.replace(
											".",
											"",
										)}
										type="button"
										className={`block w-full px-3 py-2 text-left text-sm font-medium ${
											item.isDanger
												? "text-red-700 hover:bg-red-50"
												: "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
										} transition-colors`}
										onClick={() => handleItemClick(item)}
									>
										{item.label}
									</button>
								),
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
