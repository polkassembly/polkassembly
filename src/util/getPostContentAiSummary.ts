// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { ProposalType, getFirestoreProposalType } from '~src/global/proposalType';

export const getContentSummary = async (post: any, network: string, isExternalApiCall?: boolean) => {
	if (post) {
		if (!isExternalApiCall && !post.summary && post.content && !(post.content || '').includes('If you own this account, login and tell us more about your proposal.')) {
			const res = await fetch('https://api.openai.com/v1/chat/completions', {
				body: JSON.stringify({
					frequency_penalty: 0.0,
					max_tokens: 256,
					messages: [
						{
							'content': `Summarize polkassembly ${post.type} post content you are provided with for a second-grade student in 5 bullet points and don't give any redundant markdown.`,
							'role': 'system'
						},
						{
							'content': `${post.content}\n\nTl;dr`,
							'role': 'user'
						}
					],
					model: 'gpt-3.5-turbo',
					presence_penalty: 0.0,
					temperature: 0,
					top_p: 1.0
				}),
				headers: {
					'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
					'Content-Type': 'application/json'
				},
				method: 'POST'
			});
			const data = await res.json();
			if (data && data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
				const summary = data.choices[0]?.message?.content;
				post.summary = summary;
				const postRef = postsByTypeRef(network, getFirestoreProposalType(post.type || '') as ProposalType).doc(String(post.type === 'Tips'? post.hash: post.post_id));
				if (postRef && summary) {
					postRef.get().then((doc) => {
						if (doc.exists) {
							postRef.set({ summary: summary }, { merge: true }).then(() => {}).catch(() => {});
						}
					});
				}
			}
		}
	}
};