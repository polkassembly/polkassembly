import OpenAI from 'openai';
import { IOpenAIResponse } from '../types';
import dayjs from 'dayjs';
import { log } from 'firebase-functions/logger';

export default async function getOpenAiResponse(openAIClient: OpenAI, prompt: string) {
	const systemTemplate = `
		Assume current unix timestamp to be ${dayjs(new Date()).format('x')}
		You are a Twitter Bounty Bot for Polkassembly, users will tag you on twitter in a tweet with all details provided regarding a bounty they are posting.
		You have to understand the text provided and parse the tweet into the following variables.

		% RESPONSE FORMAT:
		The response must be a JSON object, with the below fields populated from the text given.

		1. reward. (Required Field, string)
		2. task. (Required Field, string)
		3. deadline. (Required Field, string, if deadline is not mentioned in the text, just return an empty string. Else, you must just return the string which corresponds to the deadline)
		4. max_claims. (Required Field, number, but in case it is not mentioned in the text, assume as 1)

		If there is any missing information, then the response for that particular field must be;
		null
	`;

	const finalPrompt = `${systemTemplate}\n\nText: ${prompt}`;

	const chatCompletion = await openAIClient.chat.completions.create({
		messages: [{ role: 'user', content: finalPrompt }],
		model: 'gpt-3.5-turbo'
	});

	log('AI chatCompletion: ', { chatCompletion });

	return JSON.parse(chatCompletion.choices?.[0]?.message.content || '{}') as IOpenAIResponse;
}
