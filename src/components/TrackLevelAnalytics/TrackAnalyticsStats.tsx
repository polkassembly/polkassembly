// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Spin } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ITrackAnalyticsStats } from '~src/types';
import { MessageType } from '~src/auth/types';
import { useDispatch } from 'react-redux';
import { setTrackLevelAnalyticsStats } from '~src/redux/trackLevelAnalytics';
import { useTrackLevelAnalytics } from '~src/redux/selectors';
import { useTranslation } from 'next-i18next';

interface IProps {
	className?: string;
	trackId?: number;
}

const TrackAnalyticsStats: FC<IProps> = (props) => {
	const { trackId } = props;
	const dispatch = useDispatch();
	const { t } = useTranslation('common');
	const { activeProposals, allProposals } = useTrackLevelAnalytics();
	const [loading, setLoading] = useState<boolean>(false);

	const getData = async () => {
		setLoading(true);
		const url = trackId === undefined ? '/api/v1/trackLevelAnalytics/all-track-analytics-stats' : '/api/v1/trackLevelAnalytics/track-analytics-stats';
		const payload = trackId === undefined ? {} : { trackId: trackId };
		try {
			const { data } = await nextApiClientFetch<ITrackAnalyticsStats | MessageType>(url, payload);
			if (data) {
				dispatch(setTrackLevelAnalyticsStats(data));
				setLoading(false);
			}
		} catch (error) {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		if (trackId && isNaN(trackId)) return;
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackId]);

	return (
		<Spin spinning={loading}>
			<div className='mr-2.5 mt-2 flex items-center justify-between max-sm:flex-col lg:max-w-[55%]'>
				{/* Proposal Created */}
				<div className='flex items-start space-x-2 max-sm:w-full max-sm:justify-start'>
					<ImageIcon
						src='/assets/icons/analytics/proposal-created.svg'
						alt={t('proposal_created_icon')}
						className=''
					/>
					<div className='flex flex-col'>
						<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>{t('proposal_created')}</span>
						<span className='text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{allProposals?.total}</span>
					</div>
				</div>

				<Divider
					className='hidden h-[87px] bg-section-light-container dark:bg-separatorDark sm:flex'
					type='vertical'
				/>
				<Divider className=' bg-section-light-container dark:bg-separatorDark sm:hidden' />

				{/* Active Proposals */}
				<div className='flex items-center space-x-2 max-sm:w-full max-sm:justify-start'>
					<ImageIcon
						src='/assets/icons/analytics/discussions-created.svg'
						alt={t('active_proposals_icon')}
						className=''
					/>
					<div className='flex flex-col'>
						<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>{t('active_proposals')}</span>
						<span className='text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{activeProposals.total}</span>
						<div className='flex items-center space-x-1'>
							<ImageIcon
								src='/assets/icons/analytics/green-arrow-top.svg'
								alt={t('arrow_up_icon')}
								imgClassName='-mt-1'
							/>
							<span className='text-xs font-bold text-[#00AC4F]'>{isNaN(Number(activeProposals?.diff)) ? 0 : Number(activeProposals?.diff)}%</span>
							<span className='text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>{t('this_week')}</span>
						</div>
					</div>
				</div>
			</div>
		</Spin>
	);
};

export default TrackAnalyticsStats;
