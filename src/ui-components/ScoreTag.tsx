// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState, useCallback } from 'react';
import StarIcon from '~assets/icons/StarIcon.svg';
import { poppins } from 'pages/_app';
import { Tooltip } from 'antd';
import Image from 'next/image';
import styled from 'styled-components';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { EUserActivityCategory, LeaderboardPointsResponse } from '~src/types';

interface Props {
	score: number;
	className?: string;
	iconWrapperClassName?: string;
	scale?: number;
	userId?: number;
	showPointsInfo?: boolean;
}

const ScoreTag = ({ score, className, iconWrapperClassName, scale = 1, userId, showPointsInfo }: Props) => {
	const [scores, setScores] = useState({
		offChain: 0,
		onChain: 0
	});

	const fetchUserActivityData = useCallback(async () => {
		if (!userId) return;

		try {
			const [offChainRes, onChainRes] = await Promise.all([
				nextApiClientFetch<LeaderboardPointsResponse>(`api/v1/leaderboard/user-points?user_id=${userId}&activity_category=${EUserActivityCategory.OFF_CHAIN}`),
				nextApiClientFetch<LeaderboardPointsResponse>(`api/v1/leaderboard/user-points?user_id=${userId}&activity_category=${EUserActivityCategory.ON_CHAIN}`)
			]);

			setScores({
				offChain: offChainRes.data?.points || 0,
				onChain: onChainRes.data?.points || 0
			});
		} catch (error) {
			console.error(error);
		}
	}, [userId]);

	useEffect(() => {
		fetchUserActivityData();
	}, [fetchUserActivityData]);

	return (
		<Tooltip
			color='#363636'
			className={`${className} max-w-[505px]`}
			open={showPointsInfo}
			title={
				<article className='flex max-w-[505px] items-center justify-center gap-x-2 whitespace-nowrap text-sm text-white'>
					{[
						{ icon: '/assets/icons/onChain-icon.svg', label: 'On-chain activity', score: scores.onChain },
						{ icon: '/assets/icons/offChain-icon.svg', label: 'Off-chain activity', score: scores.offChain }
					].map(({ icon, label, score }, index) => (
						<div
							key={index}
							className='flex items-center justify-center gap-x-1'
						>
							<Image
								src={icon}
								alt={`${label.toLowerCase().replace(' ', '-')}-icon`}
								height={20}
								width={20}
								className='cursor-pointer'
							/>
							<p className='m-0 p-0 text-sm text-white'>{label}:</p>
							<span className='m-0 p-0 text-sm text-[#2AE653]'>{score}</span>
						</div>
					))}
				</article>
			}
		>
			<div
				className={`${poppins.className} ${poppins.variable} flex cursor-pointer items-center justify-start gap-x-0.5 rounded-md px-1 ${className}`}
				style={{ background: 'linear-gradient(0deg, #FFD669 0%, #FFD669 100%), #FCC636' }}
			>
				<span className={`${iconWrapperClassName}`}>
					<StarIcon style={{ transform: `scale(${scale})` }} />
				</span>
				<p className='m-0 ml-1 p-0 text-sm font-medium text-[#534930]'>{score}</p>
			</div>
		</Tooltip>
	);
};

export default styled(ScoreTag)`
	.ant-tooltip {
		width: 505px !important;
		max-width: 505px !important;
	}
`;
