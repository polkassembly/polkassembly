// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

class AI {
	constructor() {}

	private async fetch(url: string, body: Object) {
		const res = await fetch(url, {
			body: JSON.stringify(body),
			headers: {
				'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
				'Content-Type': 'application/json'
			},
			method: 'POST'
		});
		return await res.json();
	}

	async fetchSummary(content: string) {
		const url = 'https://api.openai.com/v1/chat/completions';
		const body = {
			frequency_penalty: 0.0,
			max_tokens: 256,
			messages: [
				{
					'content': "Summarize Townhall post content you are provided with for a second-grade student in 5 bullet points and don't give any redundant html.",
					'role': 'system'
				},
				{
					'content': `${content}\n\nTl;dr`,
					'role': 'user'
				}
			],
			model: 'gpt-3.5-turbo',
			presence_penalty: 0.0,
			temperature: 0,
			top_p: 1.0
		};
		return await this.fetch(url, body);
	}

	async analyzeSentiment(post: string, comments: string[]) {
		const prompt = `
Analyze the sentiment of the comments related to the post and determine if they are for or against the post. Provide reasons for the sentiment expressed in each comment.

Post: "${post}"
Comments:
${comments.map((comment, index) => {
		return `${(index + 1)}. "${comment}."` ;
	}).join('\n')}
        `;
		const url = 'https://api.openai.com/v1/engines/davinci/completions';
		const body = {
			max_tokens: 300, // Adjust based on your requirements
			prompt: prompt,
			temperature: 0.7 // Adjust to control response randomness
		};
		return await this.fetch(url, body);
	}
}

export default AI;
