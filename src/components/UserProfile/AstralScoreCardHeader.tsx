// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import dayjs from 'dayjs';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { LeaderboardResponse } from 'pages/api/v1/leaderboard';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ProfileDetailsResponse } from '~src/auth/types';
import { EUserActivityCategory, LeaderboardPointsResponse } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import REPUTATION_SCORES from '~src/util/reputationScores';

interface Props {
	className?: string;
	userProfile: ProfileDetailsResponse;
}

const AstralScoreCardHeader = ({ userProfile, className }: Props) => {
	const [userRank, setUserRank] = useState<number>(0);
	const [userScore, setUserScore] = useState<number>(0);
	const { resolvedTheme: theme } = useTheme();
	const [activityTypes, setActivityTypes] = useState<string[]>([]);
	const [page, setPage] = useState<number>(1);
	const [scores, setScores] = useState({ offChain: 0, onChain: 0 });

	const thresholdDate = dayjs().subtract(90, 'day');

	const getCurrentUserData = useCallback(async () => {
		if (!userProfile?.username) return;
		try {
			const username = userProfile?.username;
			const response = await nextApiClientFetch<LeaderboardResponse>('api/v1/leaderboard', { username });
			if (response?.data) {
				setUserRank(response?.data?.data[0]?.rank || 0);
				setUserScore(response?.data?.data[0]?.profile_score || 0);
			}
		} catch (error) {
			console.error('Failed to fetch current user data:', error);
		}
	}, [userProfile?.username]);

	const fetchActivityBefore90Days = useCallback(async () => {
		if (!userProfile?.user_id) return;

		try {
			let newPage = page;
			let hasOlderData = true;

			while (hasOlderData) {
				const user_id = userProfile?.user_id;
				const response = await nextApiClientFetch<LeaderboardPointsResponse>(`api/v1/leaderboard/user-points?user_id=${user_id}&page=${newPage}`);

				const activities = response?.data?.data || [];

				for (const activity of activities) {
					const createdAt = dayjs(activity.created_at);

					if (createdAt.isBefore(thresholdDate)) {
						hasOlderData = false;
						break;
					}

					setActivityTypes((prevTypes) => [...prevTypes, activity.type]);
				}

				if (hasOlderData && activities.length > 0) {
					newPage += 1;
					setPage(newPage);
				} else {
					hasOlderData = false;
				}
			}
		} catch (error) {
			console.error('Error fetching user activities:', error);
		}
	}, [userProfile?.user_id, page, thresholdDate]);

	const fetchUserActivityData = useCallback(async () => {
		if (!userProfile?.user_id) return;

		try {
			const user_id = userProfile?.user_id;
			const [offChainRes, onChainRes] = await Promise.all([
				nextApiClientFetch<LeaderboardPointsResponse>(`api/v1/leaderboard/user-points?user_id=${user_id}&activity_category=${EUserActivityCategory.OFF_CHAIN}`),
				nextApiClientFetch<LeaderboardPointsResponse>(`api/v1/leaderboard/user-points?user_id=${user_id}&activity_category=${EUserActivityCategory.ON_CHAIN}`)
			]);

			setScores({
				offChain: offChainRes.data?.count || 0,
				onChain: onChainRes.data?.count || 0
			});
		} catch (error) {
			console.error(error);
		}
	}, [userProfile?.user_id]);

	useEffect(() => {
		getCurrentUserData();
	}, [getCurrentUserData]);

	useEffect(() => {
		fetchUserActivityData();
	}, [fetchUserActivityData]);

	useEffect(() => {
		fetchActivityBefore90Days();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function calculateTotalReputationScore(activityTypes: string[]): number {
		return activityTypes
			?.map((activity) => {
				const matchingScore = Object?.values(REPUTATION_SCORES)?.find((score) => score?.type === activity);
				if (matchingScore) {
					if ('value' in matchingScore) {
						return matchingScore.value;
					} else if ('first' in matchingScore) {
						return matchingScore.first;
					}
				}
				return 0;
			})
			?.reduce((total, score) => total + score, 0);
	}

	const totalReputationScore = calculateTotalReputationScore(activityTypes);

	return (
		<section
			className={`flex items-center justify-between rounded-xl border border-solid border-[#D2D8E0] px-4 py-6 dark:border-separatorDark ${className}`}
			style={{
				boxShadow: '0px 4px 6px 0px rgba(0, 0, 0, 0.08)'
			}}
		>
			<article className={'flex flex-col items-start justify-center gap-y-1'}>
				<h1 className='m-0 mt-1 flex items-center gap-x-1 text-[28px] font-bold text-bodyBlue dark:text-white'>
					{userScore} <span className='m-0 flex h-7 items-center rounded-md bg-abstainBlueColor px-2 text-sm font-semibold text-white'>Rank #{userRank}</span>
				</h1>
				<p className='m-0 flex items-center justify-start gap-x-1 p-0 text-xs font-medium text-[#98A2B3]  dark:text-blue-dark-medium'>
					Earned <span className='m-0 p-0 text-sm font-semibold text-[#FFBA03]'>+{totalReputationScore || 0}</span>in last 90 days{' '}
				</p>
			</article>
			<Divider
				className='mx-2 border border-solid border-[#D2D8E0] dark:border-separatorDark'
				type='vertical'
			/>
			<article className='flex flex-col gap-y-2'>
				<div className='flex items-center justify-start gap-x-1'>
					<Image
						src={'/assets/icons/on-chain-box-icon.svg'}
						alt=''
						className={`scale-90 ${theme === 'dark' ? 'dark-icons' : ''}`}
						width={20}
						height={20}
					/>
					<p className='m-0 p-0 text-sm font-medium text-sidebarBlue dark:text-blue-dark-medium'>On-chain Activity: </p>
					<p className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>{scores?.onChain}</p>
				</div>
				<div className='flex items-center justify-start gap-x-1'>
					<Image
						src={'/assets/icons/off-chain-box-icon.svg'}
						alt=''
						className={`scale-90 ${theme === 'dark' ? 'dark-icons' : ''}`}
						width={20}
						height={20}
					/>
					<p className='m-0 p-0 text-sm font-medium text-sidebarBlue dark:text-blue-dark-medium'>Off-chain Activity: </p>
					<p className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>{scores?.offChain}</p>
				</div>
			</article>
		</section>
	);
};

export default styled(AstralScoreCardHeader)`
	.ant-divider-vertical {
		height: 100% !important;
	}
`;
