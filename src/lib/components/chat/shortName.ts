export function shortName(name: string): string {
	let newName = name.split(':')[1] || name;
	if (
		!['xAI', 'Google', 'DeepSeek', 'Meta', 'OpenAI', 'Mistral', 'Qwen', 'Anthropic'].includes(
			name.split(':')[0]
		)
	) {
		newName = name;
	}
	return newName;
}
