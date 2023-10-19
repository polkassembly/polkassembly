// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { ILockData } from '~src/types';
import LockVotesList from './LockVotesList';
import { Empty, Modal } from 'antd';
import { poppins } from 'pages/_app';
import CloseIcon from '~assets/icons/close.svg';
import UnlockSuccessIcon from '~assets/icons/unlock-success-box.svg';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import { useEffect } from 'react';
import { formatBalance } from '@polkadot/util';

interface Props {
	className?: string;
	open: boolean;
	setOpen: (pre: boolean) => void;
	totalUnlockableBalance: BN;
	lockedBalance: BN;
	totalLockData: ILockData[];
	totalOngoingData: ILockData[];
	totalUnlockableData: ILockData[];
}

const ZERO_BN = new BN(0);
const VoteUnlockSuccessState = ({ className, open, setOpen, totalLockData, lockedBalance, totalOngoingData, totalUnlockableBalance, totalUnlockableData }: Props) => {
	const { network } = useNetworkSelector();
	const unit = chainProperties[network]?.tokenSymbol;

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network]?.tokenDecimals,
			unit
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<Modal
			open={open}
			onCancel={() => setOpen(false)}
			footer={false}
			className={`${className} ${poppins.className} ${poppins.variable}`}
			closeIcon={<CloseIcon />}
			centered
		>
			<div className='mb-6'>
				<div className='-mt-[150px] flex items-center justify-center'>
					<UnlockSuccessIcon />
				</div>
				<div className='my-4 flex items-center justify-center text-xl font-semibold tracking-[0.15%]'>Tokens unlocked successfully</div>
				<div className='mb-6 flex items-center justify-center text-2xl font-semibold tracking-[0.15%] text-pink_primary'>
					{formatedBalance((totalUnlockableBalance.toString() || '0').toString(), unit, 2)} {unit}
				</div>
				{!totalUnlockableBalance.eq(ZERO_BN) || totalLockData.length !== 0 || totalOngoingData.length !== 0 ? (
					<LockVotesList
						lockedBalance={lockedBalance}
						totalUnlockableBalance={totalUnlockableBalance}
						totalLockData={totalLockData}
						totalOngoingData={totalOngoingData}
						totalUnlockableData={totalUnlockableData}
						showBalances={false}
						votesCollapsed={true}
					/>
				) : (
					<Empty className='mt-4' />
				)}
			</div>
		</Modal>
	);
};
export default VoteUnlockSuccessState;
