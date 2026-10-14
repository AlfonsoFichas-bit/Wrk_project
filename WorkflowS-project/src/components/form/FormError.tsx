interface FormErrorProps {
	error?: string | null;
	message?: string | null;
}

export default function FormError({ error, message }: FormErrorProps) {
	const errorMessage = message || error;
	if (!errorMessage) return null;

	return (
		<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
			<p>{errorMessage}</p>
		</div>
	);
}
