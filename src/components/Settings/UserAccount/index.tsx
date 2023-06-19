// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { useUserDetailsContext } from '~src/context';
import Account from '~src/components/Settings/Account';
import Delete from '~src/components/Settings/Delete';
import Profile from '~src/components/Settings/Profile';
import Unlock from '~src/components/Settings/Unlock';
import { Divider } from 'antd';

export default function UserAccount({ network }: { network: string }) {
	const { web3signup } = useUserDetailsContext();
	return (
		<div>
			{!web3signup && (
				<>
					<Profile />
					<Divider />
				</>
			)}
			<Account />
			<Divider />
			<Unlock network={network} />
			<Delete />
		</div>
	);
}
