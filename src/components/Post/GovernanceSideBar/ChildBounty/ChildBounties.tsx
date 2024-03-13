// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Spin } from 'antd';
import { Pagination } from '~src/ui-components/Pagination';
import { IChildBountiesResponse } from 'pages/api/v1/child_bounties';
import React, { FC, useEffect, useState } from 'react';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import GovSidebarCard from '~src/ui-components/GovSidebarCard';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useTheme } from 'next-themes';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import { ResponsivePie } from '@nivo/pie';
// import { Donut } from '@ant-design/charts';

interface IChildBountiesProps {
	bountyId?: number | string | null;
	requestedAmount?: any;
}

const ChildBounties: FC<IChildBountiesProps> = (props) => {
	const { bountyId, requestedAmount } = props;
	const [loading, setLoading] = useState(true);
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

	useEffect(() => {
		setLoading(true);
		nextApiClientFetch<IChildBountiesResponse>(`api/v1/child_bounties?page=${currentPage}&listingLimit=${VOTES_LISTING_LIMIT}&postId=32`)
			.then((res) => {
				console.log(bountyId);
				console.log(requestedAmount);
				const data = res.data;
				setLoading(false);
				console.log(data);

				const totalReward = data?.child_bounties.reduce((accumulator, currentValue) => {
					return accumulator + BigInt(currentValue.reward);
				}, BigInt(0));

				const totalAwardedReward = data?.child_bounties.reduce((accumulator, currentValue) => {
					if (currentValue.status === 'Awarded') {
						return accumulator + BigInt(currentValue.reward);
					}
					return accumulator;
				}, BigInt(0));
				if (totalAwardedReward) {
					setDisbursedAmount(formatedBalance(totalAwardedReward?.toString(), unit) + ' ' + unit);
				}

				console.log(totalReward?.toString());
				if (totalReward) {
					setTotalAmount(formatedBalance(totalReward?.toString(), unit) + ' ' + unit);
				}

				if (totalAwardedReward && totalReward) {
					const remaining = totalReward - totalAwardedReward;
					setRemainingAmount(formatedBalance(remaining?.toString(), unit) + ' ' + unit);
				}
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, bountyId]);

	console.log(requestedAmount, totalAmount, disbursedAmount, remainingAmount);
	const data = [
		{
			color: 'hsl(6, 70%, 50%)',
			id: 'disbursed',
			label: 'Disbursed',
			value: disbursedAmount
		},
		{
			color: 'hsl(122, 70%, 50%)',
			id: 'remaining',
			label: 'Remaining',
			value: remainingAmount
		},
		{
			color: 'hsl(156, 70%, 50%)',
			id: 'requested',
			label: 'Requested',
			value: requestedAmount
		}
	];

	return (
		<GovSidebarCard className='min-h-[200px]'>
			<Spin
				indicator={<LoadingOutlined />}
				spinning={loading}
			></Spin>
			<div className='flex'>
				<h4 className='dashboard-heading mb-6 text-sidebarBlue dark:text-white'>Bounty Amount</h4>
				<p className='m-0 ml-auto mt-[6px] p-0 text-sm text-lightBlue dark:text-separatorDark'>
					Total: <span className='m-0 p-0 text-aye_green_Dark dark:text-[#22A93F] dark:text-aye_green_Dark'>{totalAmount}</span>
				</p>
			</div>
			<ResponsivePie
				data={data}
				margin={{ bottom: 80, left: 80, right: 80, top: 40 }}
				innerRadius={0.8}
				cornerRadius={3}
				activeOuterRadiusOffset={8}
				borderWidth={1}
				borderColor={{
					from: 'color',
					modifiers: [['darker', 0.2]]
				}}
				arcLinkLabelsSkipAngle={10}
				arcLinkLabelsTextColor='#333333'
				arcLinkLabelsThickness={2}
				arcLinkLabelsColor={{ from: 'color' }}
				arcLabelsSkipAngle={10}
				arcLabelsTextColor={{
					from: 'color',
					modifiers: [['darker', 2]]
				}}
				defs={[
					{
						background: 'inherit',
						color: 'rgba(255, 255, 255, 0.3)',
						id: 'dots',
						padding: 1,
						size: 4,
						stagger: true,
						type: 'patternDots'
					},
					{
						background: 'inherit',
						color: 'rgba(255, 255, 255, 0.3)',
						id: 'lines',
						lineWidth: 6,
						rotation: -45,
						spacing: 10,
						type: 'patternLines'
					}
				]}
				fill={[
					{
						id: 'dots',
						match: {
							id: 'ruby'
						}
					},
					{
						id: 'dots',
						match: {
							id: 'c'
						}
					},
					{
						id: 'dots',
						match: {
							id: 'go'
						}
					},
					{
						id: 'dots',
						match: {
							id: 'python'
						}
					},
					{
						id: 'lines',
						match: {
							id: 'scala'
						}
					},
					{
						id: 'lines',
						match: {
							id: 'lisp'
						}
					},
					{
						id: 'lines',
						match: {
							id: 'elixir'
						}
					},
					{
						id: 'lines',
						match: {
							id: 'javascript'
						}
					}
				]}
				legends={[
					{
						anchor: 'bottom',
						direction: 'row',
						effects: [
							{
								on: 'hover',
								style: {
									itemTextColor: '#000'
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
						translateX: 0,
						translateY: 56
					}
				]}
			/>

			<PaginationContainer className='mt-4 flex items-center justify-end'>
				<Pagination
					theme={theme}
					size='small'
					className='pagination-container'
					current={currentPage}
					// total={bountiesRes?.child_bounties_count}
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
