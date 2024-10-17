// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import { useTheme } from 'next-themes';
import Image from 'next/image';
// import { useRouter } from 'next/router';
import { LeaderboardResponse } from 'pages/api/v1/leaderboard';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import StarIcon from '~assets/icons/StarIcon.svg';
import { ProfileDetailsResponse } from '~src/auth/types';
import { GlobalActions } from '~src/redux/global';
import { EAstralInfoTab } from '~src/redux/global/@types';
import { useGlobalSelector } from '~src/redux/selectors';
import { EUserActivityCategory, LeaderboardPointsResponse } from '~src/types';
import { AstralIcon } from '~src/ui-components/CustomIcons';
import ImageIcon from '~src/ui-components/ImageIcon';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import AllAstralPoints from './AstralInfoTabs/AllAstralPoints';
import Link from 'next/link';

interface Props {
	className?: string;
	theme?: string;
	userProfile: ProfileDetailsResponse;
}

const AstralPoints = ({ className, userProfile }: Props) => {
	const { current_astral_info_tab } = useGlobalSelector();
	const { resolvedTheme: theme } = useTheme();
	const [userRank, setUserRank] = useState<number>(0);
	const [userScore, setUserScore] = useState<number>(0);
	const [scores, setScores] = useState({ offChain: 0, onChain: 0 });
	// const router = useRouter();
	const dispatch = useDispatch();

	const { username, user_id } = userProfile;

	const getCurrentUserData = useCallback(async () => {
		if (!username) return;
		try {
			const response = await nextApiClientFetch<LeaderboardResponse>('api/v1/leaderboard', { username });
			if (response?.data) {
				setUserRank(response?.data?.data[0]?.rank || 0);
				setUserScore(response?.data?.data[0]?.profile_score || 0);
			}
		} catch (error) {
			console.error('Failed to fetch current user data:', error);
		}
	}, [username]);

	const fetchUserActivityData = useCallback(async () => {
		if (!user_id) return;

		try {
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
	}, [user_id]);

	useEffect(() => {
		fetchUserActivityData();
	}, [fetchUserActivityData]);

	useEffect(() => {
		getCurrentUserData();
	}, [getCurrentUserData]);

	const renderActivityCard = (title: string, score: number, tab: EAstralInfoTab, iconSrc: string) => (
		<div
			className={classNames(
				'flex h-[74px] cursor-pointer items-center gap-x-2 rounded-xl border border-solid px-5 py-3',
				current_astral_info_tab === tab ? 'border-pink_primary bg-[#FEF2F8] dark:border-[#FF0088]' : 'border-[#D2D8E0] bg-transparent dark:border-separatorDark'
			)}
			style={{ boxShadow: '0px 4px 6px 0px rgba(0, 0, 0, 0.08)' }}
			onClick={() => dispatch(GlobalActions.setCurrentAstralTab(tab))}
		>
			<div
				className={classNames(
					'flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-solid bg-transparent',
					current_astral_info_tab === tab ? 'border-pink_primary' : 'border-[#D2D8E0] dark:border-separatorDark'
				)}
			>
				<div
					className={classNames(
						'flex h-8 w-8 items-center justify-center rounded',
						current_astral_info_tab === tab ? 'bg-pink_primary_semi_transparent' : 'bg-[#F3F4F6] dark:bg-modalOverlayDark'
					)}
				>
					<Image
						src={current_astral_info_tab === tab ? `${iconSrc}-pink.svg` : `${iconSrc}.svg`}
						alt={`${title.toLowerCase()}-icon`}
						height={20}
						width={20}
						className={theme === 'dark' && current_astral_info_tab !== tab ? 'dark-icons' : 'text-lightBlue'}
					/>
				</div>
			</div>
			<p className={`m-0 text-base font-semibold ${current_astral_info_tab === tab ? 'text-pink_primary' : 'text-sidebarBlue dark:text-blue-dark-medium'}`}>{title}</p>
			<div
				className='flex h-[20px] items-center gap-x-1 rounded-md px-1'
				style={{ background: 'linear-gradient(0deg, #FFD669 0%, #FFD669 100%), #FCC636' }}
			>
				<StarIcon />
				<p className='m-0 p-0 text-sm font-medium text-[#534930]'>{score}</p>
			</div>
		</div>
	);

	return (
		<section
			className={classNames(
				className,
				'mt-6 flex flex-col gap-5 rounded-[14px] border border-solid border-section-light-container bg-white px-6 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
			)}
		>
			<header className='flex items-center justify-between gap-4 max-md:px-0'>
				<div className='flex w-full items-center gap-2 text-xl font-medium max-md:justify-start'>
					<AstralIcon className='mt-1 text-[28px] text-lightBlue dark:text-[#9e9e9e]' />
					<div className='flex items-center gap-1 text-bodyBlue dark:text-white'>Astrals</div>
				</div>
			</header>
			<article className='flex justify-start gap-x-5'>
				<div
					className={classNames(
						'flex h-[74px] cursor-pointer flex-col items-start justify-center gap-y-1 rounded-xl border border-solid px-5 py-3',
						current_astral_info_tab === EAstralInfoTab.ALL_INFO
							? 'border-pink_primary bg-[#FEF2F8] dark:border-[#FF0088]'
							: 'border-[#D2D8E0] bg-transparent dark:border-separatorDark'
					)}
					style={{ boxShadow: '0px 4px 6px 0px rgba(0, 0, 0, 0.08)' }}
					onClick={() => dispatch(GlobalActions.setCurrentAstralTab(EAstralInfoTab.ALL_INFO))}
				>
					<h1
						className={classNames(
							'm-0 flex items-center gap-x-1 text-[28px] font-bold',
							current_astral_info_tab === EAstralInfoTab.ALL_INFO ? 'text-bodyBlue' : 'text-bodyBlue dark:text-white'
						)}
					>
						{userScore} <span className='m-0 flex h-7 items-center rounded-md bg-abstainBlueColor px-2 text-sm font-semibold text-white'>Rank #{userRank}</span>
						<Link
							href='/astral-scoring'
							target='_blank'
						>
							<ImageIcon
								src='/assets/icons/rounded-que-icon.svg'
								alt='qna-icon'
							/>
						</Link>
					</h1>
					{/* <p className='m-0 flex items-center gap-x-1 text-xs font-medium text-[#98A2B3] dark:text-blue-dark-medium'>
						Earned <span className='text-sm font-semibold text-[#FFBA03]'>+40</span> in last 90 days{' '}
						<div onClick={() => router.push('/astral-scoring')}>
							<ImageIcon
								src='/assets/icons/rounded-que-icon.svg'
								alt='qna-icon'
							/>
						</div>
					</p> */}
				</div>
				{renderActivityCard('On-chain activity', scores.onChain, EAstralInfoTab.ON_CHAIN_ACTIVITY, '/assets/icons/on-chain-box-icon')}
				{renderActivityCard('Off-chain activity', scores.offChain, EAstralInfoTab.OFF_CHAIN_ACTIVITY, '/assets/icons/off-chain-box-icon')}
			</article>
			{current_astral_info_tab === EAstralInfoTab?.ALL_INFO && <AllAstralPoints userId={user_id} />}
			{current_astral_info_tab === EAstralInfoTab?.ON_CHAIN_ACTIVITY && (
				<AllAstralPoints
					userId={user_id}
					type={EUserActivityCategory?.ON_CHAIN}
				/>
			)}
			{current_astral_info_tab === EAstralInfoTab?.OFF_CHAIN_ACTIVITY && (
				<AllAstralPoints
					userId={user_id}
					type={EUserActivityCategory?.OFF_CHAIN}
				/>
			)}
		</section>
	);
};

export default AstralPoints;
