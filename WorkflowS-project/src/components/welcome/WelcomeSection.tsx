interface WelcomeSectionProps {
	title: string;
	description?: string;
	children: React.ReactElement | React.ReactElement[];
}

export default function WelcomeSection({
	title,
	description,
	children,
}: WelcomeSectionProps) {
	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
			{description && <p className="text-gray-600 mb-6">{description}</p>}
			{children}
		</div>
	);
}
