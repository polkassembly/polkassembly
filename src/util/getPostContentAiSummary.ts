// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import striptags from 'striptags';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { ProposalType, getFirestoreProposalType } from '~src/global/proposalType';

export const getContentSummary = async (post: any, network: string, isExternalApiCall?: boolean) => {
	if (post) {
		if (!isExternalApiCall && !post.summary && post.content && !(post.content || '').includes('If you own this account, login and tell us more about your proposal.')) {
			const summary = await fetchContentSummary(post.content, post.type);
			if (summary) {
				post.summary = summary;
				const postRef = postsByTypeRef(network, getFirestoreProposalType(post.type || '') as ProposalType).doc(String(post.type === 'Tips' ? post.hash : post.post_id));
				if (postRef && summary) {
					postRef.get().then(() => {
						postRef
							.set({ summary: summary }, { merge: true })
							.then(() => {})
							.catch(() => {});
					});
				}
			}
		}
	}
};

export const fetchContentSummary = async (content: string, type: string, _prompt?: string) => {
	const prompt = _prompt || process.env.AI_PROMPT?.replace('{type}', type);
	const res = await fetch('https://api.openai.com/v1/chat/completions', {
		body: JSON.stringify({
			frequency_penalty: 0.0,
			max_tokens: 1024,
			messages: [
				{
					content: prompt,
					role: 'system'
				},
				{
					content: `${striptags(content)}\n\nTl;dr`,
					role: 'user'
				}
			],
			model: 'gpt-3.5-turbo',
			presence_penalty: 0.0,
			temperature: 0,
			top_p: 1.0
		}),
		headers: {
			Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
			'Content-Type': 'application/json'
		},
		method: 'POST'
	});
	const data = await res.json();
	if (data && data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
		const summary = data.choices[0]?.message?.content;
		return summary;
	}
};

export const isSpamDetected = async (content: string) => {
	const prompt = process.env.SPAM_CHECK_PROMPT || 'Determine if the following content is spam. Respond with "yes" if it is spam, or "no" if it is not spam.';
	const res = await fetch('https://api.openai.com/v1/chat/completions', {
		body: JSON.stringify({
			frequency_penalty: 0.0,
			max_tokens: 10,
			messages: [
				{
					content: prompt,
					role: 'system'
				},
				{
					content: `${striptags(content)}`,
					role: 'user'
				}
			],
			model: 'gpt-3.5-turbo',
			presence_penalty: 0.0,
			temperature: 0,
			top_p: 1.0
		}),
		headers: {
			Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
			'Content-Type': 'application/json'
		},
		method: 'POST'
	});
	const data = await res.json();
	if (data && data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
		const spamCheckResult = data.choices[0]?.message?.content.trim().toLowerCase();
		return spamCheckResult === 'yes';
	}
	return false;
};
