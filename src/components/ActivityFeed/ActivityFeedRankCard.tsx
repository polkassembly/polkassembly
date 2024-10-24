// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { LeaderboardResponse } from 'pages/api/v1/leaderboard';
import React, { useEffect, useState } from 'react';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import Address from '~src/ui-components/Address';
import ScoreTag from '~src/ui-components/ScoreTag';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useTranslation } from 'next-i18next';

interface IRankCardProps {
	setLoginOpen: (open: boolean) => void;
}

const ActivityFeedRankCard: React.FC<IRankCardProps> = ({ setLoginOpen }) => {
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common');
	const currentUser = useUserDetailsSelector();
	const username = currentUser?.username;
	const [profilescore, setProfileScore] = useState<number | null>(null);
	const { network } = useNetworkSelector();
	const [userRank, setUserRank] = useState<number | 0>(0);

	const getUserProfile = async (username: string) => {
		try {
			const { data: userProfileData, error: userProfileError } = await nextApiClientFetch<any>(`api/v1/auth/data/userProfileWithUsername?username=${username}`);
			if (userProfileError) {
				console.error('Error fetching user profile:', userProfileError);
				return;
			}
			if (userProfileData) {
				setProfileScore(userProfileData?.profile_score);

				const { data: leaderboardData, error: leaderboardError } = await nextApiClientFetch<LeaderboardResponse>('api/v1/leaderboard', { username });
				if (leaderboardError) {
					console.error('Error fetching leaderboard data:', leaderboardError);
					return;
				}

				if (leaderboardData && leaderboardData?.data && leaderboardData?.data?.length > 0) {
					const userRank = leaderboardData?.data[0]?.rank;
					setUserRank(userRank);
				} else {
					console.log(t('user_rank_not_found'));
				}
			}
		} catch (err) {
			console.error('An unexpected error occurred:', err);
		}
	};

	useEffect(() => {
		if (username) {
			getUserProfile(username?.toString());
		} else {
			console.error(t('username_not_available'));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [username, network]);

	return (
		<div>
			<div className='relative mt-5 rounded-xxl text-[13px]'>
				<p className='absolute left-1/2 top-3 z-10 -translate-x-1/2 transform text-[14px] font-bold text-[#243A57]'>
					{t('rank')} {userRank ?? '#00'}
				</p>
				<div className='relative h-full w-full'>
					<Image
						src='/assets/rankcard1.svg'
						className='h-full w-full'
						alt='rankcard1'
						width={340}
						height={340}
					/>
					<div className='absolute left-1/2 z-20 w-full -translate-x-1/2 transform p-[0.2px] xl:-bottom-3 2xl:-bottom-2'>
						<Image
							src={theme === 'dark' ? '/assets/rankcard2-dark.svg' : '/assets/rankcard2.svg'}
							className='max-h-[100px] w-full'
							alt='rankcard2'
							width={340}
							height={340}
						/>
						{currentUser?.username && currentUser?.id ? (
							<div className='absolute bottom-5 left-0 right-0 flex items-center justify-between p-3'>
								<div className='flex items-center gap-2'>
									<Address
										iconSize={22}
										address={currentUser?.defaultAddress || ''}
										displayInline
										isTruncateUsername={false}
										disableTooltip
									/>
								</div>
								<div className='flex items-center gap-4'>
									<ScoreTag
										className='  pt-1'
										score={profilescore || 0}
									/>
								</div>
							</div>
						) : (
							<div className='absolute bottom-4 left-0 right-0 flex justify-center'>
								<p className='text-center font-poppins text-[16px] font-semibold text-[#243A57] dark:text-white'>
									<span
										onClick={() => setLoginOpen(true)}
										className='cursor-pointer text-pink_primary underline'
									>
										{t('login')}
									</span>{' '}
									{t('to_see_your_rank')}.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ActivityFeedRankCard;
