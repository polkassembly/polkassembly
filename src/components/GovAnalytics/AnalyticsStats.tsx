// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, Spin } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkSelector } from '~src/redux/selectors';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { IGetTotalApprovedProposalCount, IStats } from './types';
import { MessageType } from '~src/auth/types';

const AnalyticsStats: FC<IStats> = (props) => {
	const { trackId } = props;
	// const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const [totalApprovedProposalCount, setTotalApprovedProposalCount] = useState(0);
	const [totalProposalCount, setTotalProposalCount] = useState(0);
	const [loading, setLoading] = useState<boolean>(false);

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
		if (trackId && isNaN(trackId)) return;
		getData();
		getAllProposalData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackId]);

	return (
		<Spin spinning={loading}>
			<div className='mr-2.5 mt-2 flex items-center justify-between max-sm:flex-col lg:max-w-[100%]'>
				<div className='flex items-center space-x-2 max-sm:w-full max-sm:justify-start'>
					<ImageIcon
						src='/assets/icons/analytics/proposal-created.svg'
						alt='proposal created icon'
						className=''
					/>
					<div className='flex flex-col'>
						<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Total Proposals</span>
						<span className='text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{totalProposalCount}</span>
					</div>
				</div>

				<Divider
					className='hidden h-[87px] bg-section-light-container dark:bg-separatorDark sm:flex'
					type='vertical'
				/>
				<div className='flex items-center space-x-2 max-sm:w-full max-sm:justify-start'>
					<div className='flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#CCF3FF]'>
						<ImageIcon
							src='/assets/icons/total-proposal-icon.svg'
							alt='proposal created icon'
							className='-mt-0.5 ml-1'
						/>
					</div>
					<div className='flex flex-col'>
						<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Approved Proposal</span>
						<span className='text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{totalApprovedProposalCount}</span>
					</div>
				</div>

				<Divider
					className='hidden h-[87px] bg-section-light-container dark:bg-separatorDark sm:flex'
					type='vertical'
				/>

				<div className='flex items-center space-x-2 max-sm:w-full max-sm:justify-start'>
					<ImageIcon
						src='/assets/icons/analytics/discussions-created.svg'
						alt='proposal created icon'
						className=''
					/>
					<div className='flex flex-col'>
						<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Monitored Tracks</span>
						<span className='text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{Object.keys(networkTrackInfo[network]).length}</span>
					</div>
				</div>
			</div>
		</Spin>
	);
};

export default AnalyticsStats;
