import type React from "react";

export function AppLogoIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<title>WorkflowS Logo</title>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM6 15.98C6.29 14.18 9.4 13.5 12 13.5C14.6 13.5 17.71 14.18 18 15.98V18H6V15.98Z"
			/>
		</svg>
	);
}
