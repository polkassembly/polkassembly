// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useNetworkSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';
import { getDefaultTrackMetaData, getTrackData } from './AboutTrackCard';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ITrackAnalyticsStats } from '~src/types';

interface IProps {
	className?: string;
	trackName: string;
}

const TrackAnalyticsTotalData: FC<IProps> = (props) => {
	const { network } = useNetworkSelector();
	const { trackName } = props;
	const [trackMetaData, setTrackMetaData] = useState(getDefaultTrackMetaData());
	useEffect(() => {
		setTrackMetaData(getTrackData(network, trackName));
	}, [network, trackName]);
	const track_number = trackMetaData?.trackId;

	const [totalData, setTotalData] = useState<ITrackAnalyticsStats>({
		activeProposals: { diff: 0, total: 0 },
		allProposals: { diff: 0, total: '' }
	});

	const getData = async () => {
		const { data } = await nextApiClientFetch<{ data: ITrackAnalyticsStats }>('/api/v1/track_level_anaytics/analytics-stats', {
			trackNum: track_number
		});

		if (data && data?.data) {
			setTotalData(data?.data);
		}
	};

	useEffect(() => {
		if (isNaN(trackMetaData.trackId)) return;
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackMetaData.trackId]);

	return (
		<div className='mr-2.5 mt-2 flex items-center justify-between'>
			{/* Proposal Created */}
			<div className='flex items-center space-x-2'>
				<ImageIcon
					src='/assets/icons/analytics/proposal-created.svg'
					alt='proposal created icon'
					className=''
				/>
				<div className='flex flex-col'>
					<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Proposal Created</span>
					<span className='text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{totalData?.allProposals?.total}</span>
					<div className='flex items-center space-x-1'>
						<ImageIcon
							src='/assets/icons/analytics/green-arrow-top.svg'
							alt='proposal created icon'
							imgClassName='-mt-1'
						/>
						<span className='text-xs font-bold text-[#00AC4F]'>{isNaN(Number(totalData?.allProposals?.diff)) ? 0 : Number(totalData?.allProposals?.diff) * 100}%</span>
						<span className='text-xs font-normal text-[#485F7DB2] dark:text-[#909090B2]'>this week</span>
					</div>
				</div>
			</div>

			<Divider
				className='h-[87px] bg-[#D2D8E0] dark:bg-separatorDark'
				type='vertical'
			/>

			{/* Total Voting Power */}
			<div className='flex items-center space-x-2'>
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
						<span className='text-xs font-normal text-[#485F7DB2] dark:text-[#909090B2]'>this week</span>
					</div>
				</div>
			</div>

			<Divider
				className='h-[87px] bg-[#D2D8E0] dark:bg-separatorDark'
				type='vertical'
			/>

			{/* Discussions Created */}
			<div className='flex items-center space-x-2'>
				<ImageIcon
					src='/assets/icons/analytics/discussions-created.svg'
					alt='proposal created icon'
					className=''
				/>
				<div className='flex flex-col'>
					<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Active Proposals</span>
					<span className='text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{totalData.activeProposals.total}</span>
					<div className='flex items-center space-x-1'>
						<ImageIcon
							src='/assets/icons/analytics/green-arrow-top.svg'
							alt='proposal created icon'
							imgClassName='-mt-1'
						/>
						<span className='text-xs font-bold text-[#00AC4F]'>{isNaN(Number(totalData?.activeProposals?.diff)) ? 0 : Number(totalData?.activeProposals?.diff) * 100}%</span>
						<span className='text-xs font-normal text-[#485F7DB2] dark:text-[#909090B2]'>this week</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TrackAnalyticsTotalData;
