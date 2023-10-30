// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
class IPFSScript {
	private host: string;
	private secret: string;
	private environment: string;
	constructor() {
		this.host = process.env.IPFS_URL || '';
		this.secret = process.env.IPFS_SECRET || '';
		this.environment = process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'PROD' : 'DEV';
	}
	async run(data: any, documentId: string) {
		fetch(this.host, {
			body: JSON.stringify({
				data,
				documentId: documentId, // /networks/acala/post_types/democracy_proposals/posts/10,
				environment: this.environment,
				project: 'POLKASSEMBLY'
			}),
			headers: {
				'x-secret': this.secret
			},
			method: 'POST'
		});
	}
}
export default IPFSScript;
