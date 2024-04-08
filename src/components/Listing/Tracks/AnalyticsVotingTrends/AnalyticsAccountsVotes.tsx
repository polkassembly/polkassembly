// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Nudge from '~src/components/Post/Tabs/PostStats/Tabs/Nudge';
import { IVoteDetailType } from '~src/types';

interface IProps {
	accounts: IVoteDetailType[];
}

const AnalyticsAccountsVotes = ({ accounts }: IProps) => {
	console.log('accounts', accounts);
	return (
		<>
			<Nudge text='Accounts are the number of unique addresses casting a vote .' />
			<div>Hello From Account</div>
		</>
	);
};

export default AnalyticsAccountsVotes;
