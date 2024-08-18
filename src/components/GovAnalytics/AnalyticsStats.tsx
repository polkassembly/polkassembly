// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, Spin } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkSelector } from '~src/redux/selectors';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { IGetTotalApprovedProposalCount } from './types';

interface IProps {
	className?: string;
	trackId?: number;
}

const AnalyticsStats: FC<IProps> = (props) => {
	const { trackId } = props;
	// const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const [totalApprovedProposalCount, setTotalApprovedProposalCount] = useState(0);
	const [loading, setLoading] = useState<boolean>(false);

	const getData = async () => {
		setLoading(true);
		const url = '/api/v1/govAnalytics/totalApprovedProposalCount';
		try {
			const { data } = await nextApiClientFetch<IGetTotalApprovedProposalCount>(url);
			if (data) {
				setTotalApprovedProposalCount(data?.totalCount);
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
				<div className='flex items-center space-x-2 max-sm:w-full max-sm:justify-start'>
					<ImageIcon
						src='/assets/icons/analytics/proposal-created.svg'
						alt='proposal created icon'
						className=''
					/>
					<div className='flex flex-col'>
						<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Approved Proposal</span>
						<span className='text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{totalApprovedProposalCount}</span>
					</div>
				</div>

				<Divider
					className='hidden h-[87px] bg-section-light-container dark:bg-separatorDark sm:flex'
					type='vertical'
				/>
				<Divider className=' bg-section-light-container dark:bg-separatorDark sm:hidden' />

				{/* Total Voting Power */}
				{/* <div className='flex items-center space-x-2 max-sm:w-full max-sm:justify-start'>
				<ImageIcon
					src='/assets/icons/analytics/voting-power.svg'
					alt='proposal created icon'
					className=''
				/>
				<div className='flex flex-col'>
					<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Total Voting Power</span>
					<span className='text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>89</span>
					<div className='flex items-center space-x-1'>
						<ImageIcon
							src='/assets/icons/analytics/green-arrow-top.svg'
							alt='proposal created icon'
							imgClassName='-mt-1'
						/>
						<span className='text-xs font-bold text-[#00AC4F]'>11%</span>
						<span className='text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>this week</span>
					</div>
				</div>
			</div>

			<Divider
				className='hidden h-[87px] bg-section-light-container dark:bg-separatorDark sm:flex'
				type='vertical'
			/>
			<Divider className=' bg-section-light-container dark:bg-separatorDark sm:hidden' /> */}

				{/* Discussions Created */}
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
