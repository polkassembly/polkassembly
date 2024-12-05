// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useEffect, useState } from 'react';
import GovSidebarCard from '~src/ui-components/GovSidebarCard';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useTheme } from 'next-themes';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import { ResponsivePie } from '@nivo/pie';
import BN from 'bn.js';
import { usePostDataContext } from '~src/context';
import { parseBalance } from '../Modal/VoteData/utils/parseBalaceToReadable';
import { IChildBountiesResponse } from '~src/types';
import { Spin } from 'antd';
import { useTranslation } from 'next-i18next';
interface IChildBountiesProps {
	bountyIndex?: any;
	status: string;
}

const ZERO_BN = new BN(0);

const ChildBounties: FC<IChildBountiesProps> = (props) => {
	const {
		postData: { reward }
	} = usePostDataContext();
	const requestedAmount: BN = new BN(reward || '0');
	const { bountyIndex, status } = props;
	const { t } = useTranslation('common');
	const [totalAmount, setTotalAmount] = useState<any>('');
	const [amountDisbursed, setAmountDisbursed] = useState<any>('');
	const [remainingAmount, setRemainingAmount] = useState<any>('');
	const { network } = useNetworkSelector();
	const unit = `${chainProperties[network]?.tokenSymbol}`;

	const { resolvedTheme: theme } = useTheme();

	const getChildBountyData = async () => {
		const { data, error: fetchError } = await nextApiClientFetch<IChildBountiesResponse>('/api/v1/child_bounties/getAllChildBounties', {
			parentBountyIndex: bountyIndex
		});
		if (fetchError || !data) {
			console.log('error fetching events : ', fetchError);
		}

		if (data?.child_bounties) {
			let totalAmount = ZERO_BN;
			let disbursedAmount = ZERO_BN;

			for (const bounty of data.child_bounties) {
				const bnAmount = new BN(bounty?.reward || '0');
				if (bounty?.status === 'Claimed') {
					disbursedAmount = disbursedAmount.add(bnAmount);
				}
				totalAmount = totalAmount.add(bnAmount);
			}

			if (!disbursedAmount.isZero()) {
				setAmountDisbursed(status === 'Claimed' ? disbursedAmount.sub(requestedAmount) : disbursedAmount);
			}

			if (!totalAmount.isZero()) {
				setTotalAmount(totalAmount);
				const remaining = totalAmount.sub(disbursedAmount);
				setRemainingAmount(status !== 'Claimed' ? remaining.sub(requestedAmount) : remaining);
			}
		}
	};

	useEffect(() => {
		getChildBountyData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bountyIndex]);

	const data = [
		{
			color: '#FFC302',
			id: 'disbursed',
			label: t('disbursed'),
			value: parseFloat(formatedBalance(amountDisbursed.toString(), unit).replace(/,/g, ''))
		},
		{
			color: '#F1F1EF',
			id: 'remaining',
			label: t('remaining'),
			value: parseFloat(formatedBalance(remainingAmount.toString(), unit).replace(/,/g, ''))
		},
		{
			color: '#FF8E11',
			id: 'requested',
			label: t('requested'),
			value: parseFloat((formatedBalance(requestedAmount.toString(), unit) as string).replace(/,/g, ''))
		}
	];

	return (
		<GovSidebarCard className='overflow-y-hidden xl:max-h-[330px]'>
			<Spin spinning={!totalAmount}>
				<div>
					<div className='flex'>
						<h4 className='dashboard-heading text-sidebarBlue dark:text-white'>{t('bounty_amount')}</h4>
						<p className='m-0 ml-auto mt-[6px] p-0 text-sm text-lightBlue dark:text-white'>
							{t('total')}:{' '}
							<span className='m-0 p-0 text-aye_green_Dark dark:text-[#22A93F] dark:text-aye_green_Dark'>{parseBalance(totalAmount.toString(), 2, true, network)}</span>
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
												itemTextColor: `${theme === 'dark' ? '#fff' : '#485F7D'}`
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
									symbolSize: 12,
									translateX: 7,
									translateY: 50
								}
							]}
							theme={{
								legends: {
									text: {
										color: '#485F7D',
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
							valueFormat={(value) => `${value} ${unit}`}
						/>
					</div>
				</div>
			</Spin>
		</GovSidebarCard>
	);
};

export default ChildBounties;
