export interface TwitterUsersMap {
	[key: string]: {
		username: string;
		display_name: string;
		verified: boolean;
	};
}

export enum EBountySource {
	TWITTER = 'twitter',
	POLKASSEMBLY = 'polkassembly'
}

export enum BountyStatus {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED'
}

export interface IBountyReply {
	id: string; // source_id is the id here
	created_at: Date;
	updated_at: Date;
	source_author_id: string;
	display_name: string;
	username: string;
	text: string;
	source: EBountySource;
	txHash?: string;
	accepted?: boolean;
	deleted?: boolean;
}

export interface IBounty {
	id: string;
	username: string;
	display_name: string;
	status: BountyStatus;
	source: EBountySource;
	source_author_id?: string;
	source_id?: string;
	source_text?: string;
	task: string;
	amount: string;
	deadline?: Date;
	max_claims: number;
	created_at: Date;
	updated_at: Date;
	replies?: IBountyReply[];
	replies_count?: number;
	deleted?: boolean;
}

export interface IOpenAIResponse {
	reward: string | null;
	task: string | null;
	deadline: string | null;
	max_claims: number;
}
