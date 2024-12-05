// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { formatBalance } from '@polkadot/util';
import { Divider, Spin } from 'antd';
import BN from 'bn.js';
import { useApiContext } from '~src/context';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';
import { parseBalance } from '../Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IDelegationStats } from 'pages/api/v1/delegations/get-delegation-stats';
import { MessageType } from '~src/auth/types';
import { useTranslation } from 'next-i18next';

const ZERO_BN = new BN(0);

const TotalDelegationData = ({ className }: { className: string }) => {
	const { t } = useTranslation('common');
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [totalSupply, setTotalSupply] = useState<BN>(ZERO_BN);
	const [totalStats, setTotalStats] = useState<IDelegationStats>({
		totalDelegatedBalance: '0',
		totalDelegatedVotes: 0,
		totalDelegates: 0,
		totalDelegators: 0
	});
	const [loading, setLoading] = useState<boolean>(false);

	const getData = async () => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IDelegationStats | MessageType>('/api/v1/delegations/get-delegation-stats');
		if (data) {
			setTotalStats(data as IDelegationStats);
			setLoading(false);
		} else if (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (!api || !apiReady) return;
		(async () => {
			const totalIssuance = await api?.query?.balances?.totalIssuance();
			const inactiveIssuance = await api?.query?.balances?.inactiveIssuance();
			setTotalSupply(totalIssuance.sub(inactiveIssuance));
		})();
		getData();
	}, [api, apiReady]);

	return (
		<section className={className}>
			<Spin spinning={loading}>
				<div className='flex flex-wrap gap-6 rounded-xxl bg-white p-5 drop-shadow-md dark:bg-section-dark-overlay md:p-6'>
					{/* Total Supply */}
					<div className='flex space-x-3 border-2 border-section-light-container'>
						<ImageIcon
							src='/assets/delegation-tracks/polkadot-delegation.svg'
							alt='polkadot delegation icon'
						/>
						<div className='flex flex-col'>
							<span className='text-xs text-blue-light-medium dark:text-[#9E9E9EB2]'>{t('total_supply')}</span>
							<span className='text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{parseBalance(totalSupply.toString(), 2, true, network)}</span>
						</div>
					</div>
					<Divider
						type='vertical'
						className='h-[44px]'
					/>

					{/* Delegated tokens */}
					<div className='flex space-x-3'>
						<ImageIcon
							src='/assets/delegation-tracks/delegate-tokens.svg'
							alt='delegate tokens icon'
						/>
						<div className='flex flex-col '>
							<span className='text-xs text-blue-light-medium dark:text-[#9E9E9EB2]'>{t('delegated_tokens')}</span>
							<span className='text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{parseBalance(totalStats.totalDelegatedBalance, 2, true, network)}</span>
						</div>
					</div>
					<Divider
						type='vertical'
						className='h-[44px]'
					/>

					{/* Total Delegated Votes */}
					<div className='flex space-x-3'>
						<ImageIcon
							src='/assets/delegation-tracks/total-delegated-tokens.svg'
							alt='Total delegate tokens icon'
						/>
						<div className='flex flex-col '>
							<span className='text-xs text-blue-light-medium dark:text-[#9E9E9EB2]'>{t('total_delegated_votes')}</span>
							<div className='flex space-x-2'>
								<span className='text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{totalStats.totalDelegatedVotes}</span>
							</div>
						</div>
					</div>
					<Divider
						type='vertical'
						className='h-[44px]'
					/>

					{/* Total Delegates */}
					<div className='flex space-x-3'>
						<ImageIcon
							src='/assets/delegation-tracks/total-delegates.svg'
							alt='Total delegate icon'
						/>
						<div className='flex flex-col'>
							<span className='text-xs text-blue-light-medium dark:text-[#9E9E9EB2]'>{t('total_delegates')}</span>
							<span className='text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{totalStats.totalDelegates}</span>
						</div>
					</div>
					<Divider
						type='vertical'
						className='h-[44px]'
					/>

					{/* Total Delegatees */}
					<div className='flex space-x-3'>
						<ImageIcon
							src='/assets/delegation-tracks/total-delegatees.svg'
							alt='Total delegatees icon'
						/>
						<div className='flex flex-col'>
							<span className='text-xs text-blue-light-medium dark:text-[#9E9E9EB2]'>{t('total_delegators')}</span>
							<span className='text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{totalStats.totalDelegators}</span>
						</div>
					</div>
				</div>
			</Spin>
		</section>
	);
};

export default TotalDelegationData;
