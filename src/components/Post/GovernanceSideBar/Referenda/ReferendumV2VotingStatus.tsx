// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import React, { FC, useEffect, useState } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import VoteProgress from 'src/ui-components/VoteProgress';
import formatBnBalance from 'src/util/formatBnBalance';

import { useApiContext, useNetworkContext } from '~src/context';
import { usePostDataContext } from '~src/context';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';

interface IReferendumV2VotingStatusProps {
	className?: string;
	referendumId: number;
	tally?: any;
}

const ZERO = new BN(0);

const ReferendumV2VotingStatus: FC<IReferendumV2VotingStatusProps> = ({ className, tally }) => {
	const { network } = useNetworkContext();
	const { postData: { status, postIndex } } = usePostDataContext();

	const { api, apiReady } = useApiContext();

	const [tallyData, setTallyData] = useState({
		ayes: ZERO || 0,
		nays: ZERO || 0,
		support: ZERO || 0
	});

	useEffect(() => {
		if(['confirmed', 'executed', 'timedout', 'cancelled', 'rejected'].includes(status.toLowerCase())){
			setTallyData({
				ayes: String(tally?.ayes).startsWith('0x') ? new BN(tally?.ayes || 0, 'hex') : new BN(tally?.ayes || 0),
				nays: String(tally?.nays).startsWith('0x') ? new BN(tally?.nays || 0, 'hex') : new BN(tally?.nays || 0),
				support: String(tally?.support).startsWith('0x') ? new BN(tally?.support || 0, 'hex') : new BN(tally?.support || 0)
			});
			return;
		}

		if( !api || !apiReady) return;

		(async () => {
			const referendumInfoOf = await api.query.referenda.referendumInfoFor(postIndex);
			const parsedReferendumInfo: any = referendumInfoOf.toJSON();
			if (parsedReferendumInfo?.ongoing?.tally) {
				setTallyData({
					ayes: typeof parsedReferendumInfo.ongoing.tally.ayes === 'string' ? new BN(parsedReferendumInfo.ongoing.tally.ayes.slice(2), 'hex') : new BN(parsedReferendumInfo.ongoing.tally.ayes),
					nays: typeof parsedReferendumInfo.ongoing.tally.nays === 'string' ? new BN(parsedReferendumInfo.ongoing.tally.nays.slice(2), 'hex') : new BN(parsedReferendumInfo.ongoing.tally.nays),
					support: typeof parsedReferendumInfo.ongoing.tally.support === 'string' ? new BN(parsedReferendumInfo.ongoing.tally.support.slice(2), 'hex') : new BN(parsedReferendumInfo.ongoing.tally.support)
				});
			} else {
				setTallyData({
					ayes: new BN(tally?.ayes || 0, 'hex'),
					nays: new BN(tally?.nays || 0, 'hex'),
					support: new BN(tally?.support || 0, 'hex')
				});
			}
		})();

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, api, apiReady]);

	return (
		<GovSidebarCard className={className}>
			<div className='flex items-center justify-between gap-x-2'>
				<h6 className='text-sidebarBlue font-semibold text-[20px] leading-[24px] m-0 p-0'>Voting</h6>
			</div>
			<VoteProgress
				ayeVotes={tallyData.ayes}
				className='vote-progress'
				nayVotes={tallyData.nays}
			/>
			<section className='grid grid-cols-2 gap-x-7 gap-y-3 text-[#485F7D] -mt-4'>
				<article className='flex items-center justify-between gap-x-2'>
					<div className='flex items-center gap-x-1'>
						<span className='font-medium text-xs leading-[18px] tracking-[0.01em]'>
							Ayes
						</span>
					</div>
					<div
						className='text-navBlue text-xs font-medium leading-[22px]'
					>
						{tallyData.ayes.isZero()? '': '~ '}{formatUSDWithUnits(formatBnBalance(tallyData.ayes, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
					</div>
				</article>
				<article className='flex items-center justify-between gap-x-2'>
					<div className='flex items-center gap-x-1'>
						<span className='font-medium text-xs leading-[18px] tracking-[0.01em]'>
							Nays
						</span>
					</div>
					<div
						className='text-navBlue text-xs font-medium leading-[22px]'
					>
						{tallyData.nays.isZero()? '': '~ '}{formatUSDWithUnits(formatBnBalance(tallyData.nays, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
					</div>
				</article>
				<article className='flex items-center justify-between gap-x-2'>
					<div className='flex items-center gap-x-1'>
						<span className='font-medium text-xs leading-[18px] tracking-[0.01em]'>
							Support
						</span>
					</div>
					<div
						className='text-navBlue text-xs font-medium leading-[22px]'
					>
						{tallyData.support.isZero()? '': '~ '}{formatUSDWithUnits(formatBnBalance(tallyData.support, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
					</div>
				</article>
			</section>
		</GovSidebarCard>
	);
};

export default React.memo(ReferendumV2VotingStatus);