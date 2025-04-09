// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { network as AllNetworks } from '~src/global/networkConstants';
import { Network } from '~src/types';

interface IGenericObject {
	[key: string]: any;
}

interface IPostEdit {
	indexOrHash: string;
	proposalType: string;
	title: string;
	content: string;
	authorId: string;
	allowedCommentor: string;
}

interface IPostDelete {
	indexOrHash: string;
	proposalType: string;
}

enum EWebhookEvent {
	POST_EDITED = 'post_edited', // off chain and on chain
	POST_DELETED = 'post_deleted' // off chain and on chain
}

const getWebhookUrl = (network?: Network) => {
	if (Object.values(AllNetworks).includes(network || '')) {
		return `https://${network}.polkassembly.io/api/v2/webhook/`;
	}
	return 'https://test.polkassembly.io/api/v2/webhook/';
};

export class WebHooks {
	private static async sendRequest(event: EWebhookEvent, params: IGenericObject, network?: Network) {
		const url = getWebhookUrl(network) + event;
		return fetch(url, {
			body: JSON.stringify(params),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'x-tools-passphrase': process.env.TOOLS_PASSPHRASE || ''
			},
			method: 'POST'
		});
	}
	static async editPost(newPost: IPostEdit) {
		try {
			return this.sendRequest(EWebhookEvent.POST_EDITED, newPost);
		} catch (error) {
			console.log(error);
			return null;
		}
	}
	static async deletePost(postDetails: IPostDelete) {
		try {
			return this.sendRequest(EWebhookEvent.POST_DELETED, postDetails);
		} catch (error) {
			console.log(error);
			return null;
		}
	}
}
