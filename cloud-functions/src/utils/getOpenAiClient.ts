import OpenAI from 'openai';

export default function getOpenAiClient() {
	const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
	return new OpenAI({
		apiKey: OPENAI_API_KEY // This is the default and can be omitted
	});
}
