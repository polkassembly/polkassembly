// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Nudge from '~src/components/Post/Tabs/PostStats/Tabs/Nudge';
import { IVoteDetailType } from '~src/types';

interface IProps {
	voteAmount: IVoteDetailType[];
}

const AnalyticsVoteAmountVotes = ({ voteAmount }: IProps) => {
	console.log('voteAmount', voteAmount);
	return (
		<>
			<Nudge text='Vote amount is the number of tokens used for voting .' />
			<div>Hello From Vote amount</div>
		</>
	);
};

export default AnalyticsVoteAmountVotes;
