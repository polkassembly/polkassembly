// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export interface IupdateBatchVotes {
	vote: {
		referendum_index: number;
		network: string;
		decision: 'aye' | 'nay' | 'abstain';
		aye_balance: string;
		nay_balance: string;
		abstain_balance: string;
		locked_period: number;
		user_address: string;
		id: string;
	};
}

export interface IAddBatchVotes {
	vote: {
		referendum_index: number;
		network: string;
		decision: 'aye' | 'nay' | 'abstain';
		aye_balance: string;
		nay_balance: string;
		abstain_balance: string;
		locked_period: number;
		user_address: string;
	};
}

export interface IDeleteBatchVotes {
	id?: string;
	deleteWholeCart: boolean;
}

export interface ISwipeActionButtons {
	currentIndex: number;
	trackPosts: any;
	childRefs: any;
	className?: string;
	onSwipe?: any;
	onSwipeAction?: any;
	decision?: string;
	isLoading?: boolean;
}

export interface ITinderCardsComponent {
	proposal: any;
	isUsedInWebView?: boolean;
	onSkip: (pre: number) => void;
}

export interface ICardComments {
	proposal: any;
}
