// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import Address from 'src/ui-components/Address';
import formatBnBalance from 'src/util/formatBnBalance';
import { VoteType } from '~src/global/proposalType';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { network as AllNetworks } from '~src/global/networkConstants';
import { useNetworkContext } from '~src/context';

interface IDelegationListRow {
  voteType: VoteType;
  voteData?: any;
}

const DelegationListRow: FC<IDelegationListRow> = ({ voteType, voteData }) => {
	const { network } = useNetworkContext();
	return (
		<div className='flex items-center text-xs'>
			{voteType === VoteType.REFERENDUM_V2 && voteData?.txnHash ? (
				<a
					href={`https://${network}.moonscan.io/tx/${voteData.txnHash}`}
					className='w-[200px] overflow-ellipsis'
				>
					<Address
						isVoterAddress={true}
						textClassName='w-[100px]'
						isSubVisible={false}
						displayInline={true}
						isShortenAddressLength={false}
						address={voteData?.voter}
					/>
				</a>
			) : (
				<div className='w-[200px] overflow-ellipsis'>
					<Address
						textClassName='w-[100px]'
						isSubVisible={false}
						displayInline={true}
						isShortenAddressLength={false}
						address={voteData?.voter}
					/>
				</div>
			)}

			{network !== AllNetworks.COLLECTIVES ? (
				<>
					<div className='w-[115px] overflow-ellipsis'>
						{formatUSDWithUnits(
							formatBnBalance(
								voteData?.decision === 'abstain'
									? voteData?.balance?.abstain || 0
									: voteData?.balance?.value || 0,
								{
									numberAfterComma: 1,
									withThousandDelimitor: false,
									withUnit: true
								},
								network
							),
							1
						)}
					</div>
					<div className='w-[110px] overflow-ellipsis'>
						{voteData.lockPeriod
							? `${voteData.lockPeriod}x${voteData?.isDelegated ? '/d' : ''}`
							: '0.1x'}
					</div>
				</>
			) : (
				<>
					<div className='w-[120px] overflow-ellipsis'>
						{voteData?.decision === 'abstain'
							? voteData?.balance?.abstain || 0
							: voteData?.balance?.value || 0}
					</div>
				</>
			)}

			{voteData.votingPower && (
				<div className='overflow-ellipsis w-[50px]'>
					{formatUSDWithUnits(
						formatBnBalance(
							voteData.votingPower,
							{
								numberAfterComma: 1,
								withThousandDelimitor: false,
								withUnit: false
							},
							network
						),
						1
					)}
					{}
				</div>
			)}
		</div>
	);
};

export default DelegationListRow;
