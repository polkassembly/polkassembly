// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React, { FC, useState } from 'react';

import useHandleMetaMask from '~src/hooks/useHandleMetaMask';
import DemocracyUnlock from './DemocracyUnlock';
import ReferendaUnlock from './ReferendaUnlock';

interface IUnlockProps {
	network: string;
}

const Unlock: FC<IUnlockProps> = (props) => {
	const { network } = props;
	const metaMaskError = useHandleMetaMask();
	const [isBalanceUpdated, setIsBalanceUpdated] = useState(false);
	return (
		<>
			{!metaMaskError && ['moonbase', 'moonriver', 'moonbeam'].includes(network) ? (
				<>
					<DemocracyUnlock
						isBalanceUpdated={isBalanceUpdated}
						setIsBalanceUpdated={setIsBalanceUpdated}
					/>
					<Divider />
				</>
			) : null}
			{!metaMaskError && ['moonbase', 'moonriver', 'moonbeam'].includes(network) ? (
				<>
					<ReferendaUnlock
						isBalanceUpdated={isBalanceUpdated}
						setIsBalanceUpdated={setIsBalanceUpdated}
					/>
					<Divider />
				</>
			) : null}
		</>
	);
};

export default Unlock;
