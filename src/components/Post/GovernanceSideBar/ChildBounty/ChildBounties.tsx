// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Pagination } from '~src/ui-components/Pagination';
import { IChildBountiesResponse } from 'pages/api/v1/child_bounties';
import React, { FC, useEffect, useState } from 'react';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import GovSidebarCard from '~src/ui-components/GovSidebarCard';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import styled from 'styled-components';
import { useTheme } from 'next-themes';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import { ResponsivePie } from '@nivo/pie';
import { BN } from 'bn.js';
// import { Donut } from '@ant-design/charts';

interface IChildBountiesProps {
	requestedAmount?: any;
	bountyIndex?: any;
}

const ChildBounties: FC<IChildBountiesProps> = (props) => {
	const { requestedAmount, bountyIndex } = props;
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalAmount, setTotalAmount] = useState('');
	const [disbursedAmount, setDisbursedAmount] = useState('');
	const [remainingAmount, setRemainingAmount] = useState('');
	const { network } = useNetworkSelector();
	const unit = `${chainProperties[network]?.tokenSymbol}`;

	const { resolvedTheme: theme } = useTheme();
	const handlePageChange = (pageNumber: any) => {
		setCurrentPage(pageNumber);
	};

	const getChildBountyData = async () => {
		const { data, error: fetchError } = await nextApiClientFetch<IChildBountiesResponse>(
			`api/v1/child_bounties?page=${currentPage}&listingLimit=${VOTES_LISTING_LIMIT}&postId=${bountyIndex}`
		);
		if (fetchError || !data) {
			console.log('error fetching events : ', fetchError);
		}

		if (data) {
			const allRewardsAsBN = data.child_bounties.map((bounty) => new BN(bounty.reward));

			const totalReward = allRewardsAsBN.reduce((accumulator, currentReward) => accumulator.add(currentReward), new BN(0));

			const totalAwardedReward = data.child_bounties
				.filter((bounty) => bounty.status === 'Awarded')
				.map((bounty) => new BN(bounty.reward))
				.reduce((accumulator, currentReward) => accumulator.add(currentReward), new BN(0));

			if (!totalAwardedReward.isZero()) {
				setDisbursedAmount(formatedBalance(totalAwardedReward.toString(), unit) + ' ' + unit);
			}

			if (!totalReward.isZero()) {
				setTotalAmount(formatedBalance(totalReward.toString(), unit) + ' ' + unit);
			}

			if (!totalAwardedReward.isZero() && !totalReward.isZero()) {
				const remaining = totalReward.sub(totalAwardedReward);
				setRemainingAmount(formatedBalance(remaining.toString(), unit) + ' ' + unit);
			}
		}
	};

	useEffect(() => {
		getChildBountyData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, bountyIndex]);

	const data = [
		{
			color: '#FFC302',
			id: 'disbursed',
			label: 'Disbursed',
			value: parseFloat(disbursedAmount.replace('DOT', '').replace(/,/g, ''))
		},
		{
			color: '#F1F1EF',
			id: 'remaining',
			label: 'Remaining',
			value: parseFloat(remainingAmount.replace('DOT', '').replace(/,/g, ''))
		},
		{
			color: '#FF8E11',
			id: 'requested',
			label: 'Requested',
			value: parseFloat(requestedAmount.replace('DOT', '').replace(/,/g, ''))
		}
	];

	return (
		<GovSidebarCard className='overflow-y-hidden xl:max-h-[336px]'>
			<div className='flex'>
				<h4 className='dashboard-heading text-sidebarBlue dark:text-white'>Bounty Amount</h4>
				<p className='m-0 ml-auto mt-[6px] p-0 text-sm text-lightBlue dark:text-white'>
					Total: <span className='m-0 p-0 text-aye_green_Dark dark:text-[#22A93F] dark:text-aye_green_Dark'>{totalAmount}</span>
				</p>
			</div>
			<div className='-mt-3 h-[286px] '>
				<ResponsivePie
					data={data}
					margin={{ bottom: 80, left: 80, right: 80, top: 40 }}
					innerRadius={0.7}
					cornerRadius={0}
					activeOuterRadiusOffset={8}
					borderWidth={1}
					borderColor={{
						from: 'color',
						modifiers: [['darker', 0.2]]
					}}
					enableArcLabels={false}
					enableArcLinkLabels={false}
					colors={({ data }) => data.color}
					arcLinkLabelsSkipAngle={10}
					arcLinkLabelsTextColor='#333333'
					arcLinkLabelsThickness={2}
					arcLinkLabelsColor={{ from: 'color' }}
					arcLabelsSkipAngle={10}
					arcLabelsTextColor={{
						from: 'color',
						modifiers: [['darker', 2]]
					}}
					legends={[
						{
							anchor: 'bottom',
							direction: 'row',
							effects: [
								{
									on: 'hover',
									style: {
										itemTextColor: '#fff'
									}
								}
							],
							itemDirection: 'left-to-right',
							itemHeight: 18,
							itemOpacity: 1,
							itemTextColor: '#999',
							itemWidth: 100,
							itemsSpacing: 0,
							justify: false,
							symbolShape: 'circle',
							symbolSize: 18,
							translateX: 7,
							translateY: 50
						}
					]}
					theme={{
						legends: {
							text: {
								fontSize: 12
							}
						},
						tooltip: {
							container: {
								background: theme === 'dark' ? '#1E2126' : '#fff',
								color: theme === 'dark' ? '#fff' : '#576D8B',
								fontSize: 11,
								textTransform: 'capitalize'
							}
						}
					}}
				/>
			</div>

			<PaginationContainer className='mt-4 flex items-center justify-end'>
				<Pagination
					theme={theme}
					size='small'
					className='pagination-container'
					current={currentPage}
					pageSize={VOTES_LISTING_LIMIT}
					showSizeChanger={false}
					responsive={true}
					hideOnSinglePage={true}
					onChange={handlePageChange}
					showPrevNextJumpers={false}
				/>
			</PaginationContainer>
		</GovSidebarCard>
	);
};

const PaginationContainer = styled.div`
	.pagination-container .ant-pagination-item {
		border-color: #e5007a;
		color: #e5007a;
	}
	.pagination-container .ant-pagination-item-active a {
		color: #e5007a;
	}
`;

export default ChildBounties;
