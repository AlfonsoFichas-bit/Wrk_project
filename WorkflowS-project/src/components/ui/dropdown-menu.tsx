import type React from "react";
import { useEffect, useRef, useState } from "react";

interface DropdownMenuProps {
	children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
	return <div className="relative">{children}</div>;
}

interface DropdownMenuTriggerProps {
	children: React.ReactNode;
	asChild?: boolean;
}

export function DropdownMenuTrigger({
	children,
	asChild = false,
}: DropdownMenuTriggerProps) {
	const [isOpen, setIsOpen] = useState(false);

	const handleClick = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		setIsOpen(!isOpen);

		// Buscar el DropdownMenuContent y pasarle el estado
		const content = (
			e.currentTarget as HTMLElement
		).parentElement?.querySelector("[data-dropdown-content]");
		if (content) {
			content.setAttribute("data-state", isOpen ? "closed" : "open");
		}
	};

	if (asChild) {
		return (
			<button
				type="button"
				onClick={handleClick}
				onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						handleClick(e as unknown as React.MouseEvent<HTMLElement>);
					}
				}}
				data-state={isOpen ? "open" : "closed"}
			>
				{children}
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			data-state={isOpen ? "open" : "closed"}
		>
			{children}
		</button>
	);
}

interface DropdownMenuContentProps {
	children: React.ReactNode;
	align?: "start" | "center" | "end";
	side?: "top" | "right" | "bottom" | "left";
	className?: string;
}

export function DropdownMenuContent({
	children,
	align = "center",
	side = "bottom",
	className = "",
}: DropdownMenuContentProps) {
	const [isOpen, setIsOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				setIsOpen(false);
				ref.current.setAttribute("data-state", "closed");
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const alignClasses = {
		start: "origin-top-left left-0",
		center: "origin-top",
		end: "origin-top-right right-0",
	};

	const sideClasses = {
		top: "bottom-full mb-2",
		right: "left-full ml-2",
		bottom: "top-full mt-2",
		left: "right-full mr-2",
	};

	return (
		<div
			ref={ref}
			data-dropdown-content
			data-state={isOpen ? "open" : "closed"}
			className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md ${alignClasses[align]} ${sideClasses[side]} ${className}`}
		>
			{children}
		</div>
	);
}

interface DropdownMenuItemProps {
	children: React.ReactNode;
	disabled?: boolean;
	className?: string;
}

export function DropdownMenuItem({
	children,
	disabled = false,
	className = "",
}: DropdownMenuItemProps) {
	return (
		<div
			className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 ${
				disabled ? "pointer-events-none opacity-50" : ""
			} ${className}`}
		>
			{children}
		</div>
	);
}
