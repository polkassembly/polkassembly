// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import AnalyticsStats from './AnalyticsStats';
import AnalyticsTrends from './AnalyticTrends';
import AnalyticsDelegationTrends from './AnalyticsDelegationTrends';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { MessageType } from '~src/auth/types';
import { IGetTotalApprovedProposalCount } from './types';
import { useNetworkSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { Spin } from 'antd';
import { useTranslation } from 'next-i18next';

const GovAnalytics = () => {
	const { network } = useNetworkSelector();
	const { t } = useTranslation('common');
	const [totalApprovedProposalCount, setTotalApprovedProposalCount] = useState(0);
	const [totalProposalCount, setTotalProposalCount] = useState(0);
	const [loading, setLoading] = useState<boolean>(false);
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;

	const getData = async () => {
		setLoading(true);
		const url = '/api/v1/govAnalytics/totalApprovedProposalCount';
		const { data, error } = await nextApiClientFetch<IGetTotalApprovedProposalCount>(url);
		if (!data) {
			console.log('something went wrong, ', error);
		}
		if (data) {
			setTotalApprovedProposalCount(data?.totalCount);
			setLoading(false);
		}
	};

	const getAllProposalData = async () => {
		setLoading(true);
		try {
			const { data } = await nextApiClientFetch<any | MessageType>('/api/v1/trackLevelAnalytics/all-track-analytics-stats');
			if (data) {
				console.log('trackData is: ', data);
				setTotalProposalCount(data?.allProposals?.total);
				setLoading(false);
			}
		} catch (error) {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
		getAllProposalData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			{isMobile && (
				<Spin spinning={loading}>
					<article className='-mb-4 flex justify-between'>
						<div className='jusity-center flex h-[126px] w-[100px] flex-col items-center gap-y-2 rounded-xl bg-white dark:bg-black'>
							<div className='flex flex-col items-center justify-center'>
								<ImageIcon
									src='/assets/icons/analytics/discussions-created.svg'
									alt={t('proposal_created_icon')}
									className='scale-[60%]'
								/>
								<div className='flex flex-col items-center justify-center'>
									<span className='text-[10px] font-normal text-blue-light-medium dark:text-blue-dark-medium'>{t('monitored_tracks')}</span>
									<span className='text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{Object.keys(networkTrackInfo[network]).length}</span>
								</div>
							</div>
						</div>
						<div className='jusity-center flex h-[126px] w-[119px] flex-col items-center gap-y-2 rounded-xl bg-white dark:bg-black'>
							<div className='mt-4 flex flex-col items-center justify-center'>
								<div className='flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#CCF3FF]'>
									<ImageIcon
										src='/assets/icons/total-proposal-icon.svg'
										alt={t('approved_proposals_icon')}
										className='ml-1 scale-[60%]'
									/>
								</div>
								<div className='mt-4 flex flex-col items-center justify-center'>
									<span className='text-[10px] font-normal text-blue-light-medium dark:text-blue-dark-medium'>{t('approved_proposals')}</span>
									<span className='text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{totalApprovedProposalCount}</span>
								</div>
							</div>
						</div>
						<div className='jusity-center flex h-[126px] w-[100px] flex-col items-center gap-y-2 rounded-xl bg-white dark:bg-black'>
							<div className='flex flex-col items-center justify-center'>
								<ImageIcon
									src='/assets/icons/analytics/proposal-created.svg'
									alt={t('proposal_created_icon')}
									className='scale-[60%]'
								/>
								<div className='flex flex-col items-center justify-center'>
									<span className='text-[10px] font-normal text-blue-light-medium dark:text-blue-dark-medium'>{t('total_proposals')}</span>
									<span className='text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{totalProposalCount}</span>
								</div>
							</div>
						</div>
					</article>
				</Spin>
			)}
			<section className='flex h-full w-full items-center rounded-xl border-none bg-white px-6 py-4 dark:bg-black'>
				<div className='flex w-full flex-col gap-y-4'>
					{!isMobile && <AnalyticsStats />}
					<AnalyticsTrends />
					<AnalyticsDelegationTrends />
				</div>
			</section>
		</>
	);
};

export default GovAnalytics;
