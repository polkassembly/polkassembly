// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ResponsivePie } from '@nivo/pie';
import { BN } from 'bn.js';
import { useTheme } from 'next-themes';
import { IChildBountiesResponse } from 'pages/api/v1/child_bounties';
import React, { FC, useEffect, useState } from 'react';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import { formatedBalance } from '~src/util/formatedBalance';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface ITrackListingChildBountyChart {
	childBountyData?: any;
	childBountyAmount?: any;
	parentBounty?: any;
}

const TrackListingChildBountyChart: FC<ITrackListingChildBountyChart> = (props) => {
	const { childBountyAmount, parentBounty } = props;
	const [disbursedAmount, setDisbursedAmount] = useState<any>('');
	const { network } = useNetworkSelector();
	const unit = `${chainProperties[network]?.tokenSymbol}`;

	const { resolvedTheme: theme } = useTheme();

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const getChildBountyData = async () => {
		const { data, error: fetchError } = await nextApiClientFetch<IChildBountiesResponse>(`api/v1/child_bounties?listingLimit=${VOTES_LISTING_LIMIT}&postId=${parentBounty}`);
		if (fetchError || !data) {
			console.log('error fetching events : ', fetchError);
		}

		if (data) {
			const totalAwardedReward = data.child_bounties
				.filter((bounty) => bounty.status === 'Claimed')
				.map((bounty) => new BN(bounty.reward))
				.reduce((accumulator, currentReward) => accumulator.add(currentReward), new BN(0));
			setDisbursedAmount(totalAwardedReward);
		}
	};

	useEffect(() => {
		getChildBountyData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [parentBounty]);

	const childBountyData = [
		{
			color: '#FFC302',
			id: 'disbursed',
			label: 'Amount Disbursed',
			value: parseFloat(formatedBalance(disbursedAmount.toString(), network).replace(/,/g, ''))
		},
		{
			color: '#F1F1EF',
			id: 'remaining',
			label: 'Amount Remaining',
			value:
				parseFloat(formatedBalance(childBountyAmount.toString(), network).replace(/,/g, '')) - parseFloat(formatedBalance(disbursedAmount.toString(), network).replace(/,/g, ''))
		}
	];

	return (
		<div className='-ml-[64px] mt-10 h-[150px] w-[142px]'>
			<ResponsivePie
				data={childBountyData}
				margin={{ bottom: 80, left: 80, right: 80, top: 40 }}
				innerRadius={0.7}
				cornerRadius={0}
				activeOuterRadiusOffset={0}
				borderWidth={1}
				borderColor={{
					from: 'color',
					modifiers: [['darker', 0.2]]
				}}
				enableArcLabels={false}
				enableArcLinkLabels={false}
				colors={({ data }) => data?.color}
				arcLinkLabelsSkipAngle={10}
				arcLinkLabelsTextColor='#333333'
				arcLinkLabelsThickness={2}
				arcLinkLabelsColor={{ from: 'color' }}
				arcLabelsSkipAngle={10}
				arcLabelsTextColor={{
					from: 'color',
					modifiers: [['darker', 2]]
				}}
				theme={{
					legends: {
						text: {
							fontSize: 12
						}
					},
					tooltip: {
						container: {
							background: theme === 'dark' ? '#282a2d' : '#363636',
							borderRadius: '6px',
							color: theme === 'dark' ? '#fff' : '#fff',
							fontSize: 14,
							padding: '8px 16px',
							textTransform: 'capitalize'
						}
					}
				}}
				// animate={false}
				valueFormat={(value) => `${value} ${unit}`}
			/>
		</div>
	);
};

export default TrackListingChildBountyChart;
