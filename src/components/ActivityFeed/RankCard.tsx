// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTheme } from 'next-themes';
import Image from 'next/image';
import React from 'react';
import { IUserDetailsStore } from '~src/redux/userDetails/@types';
import NameLabel from '~src/ui-components/NameLabel';
import ScoreTag from '~src/ui-components/ScoreTag';

interface CurrentUserdata {
	profile_score: number;
}

interface RankCardProps {
	currentUser: IUserDetailsStore | null;
	currentUserdata: CurrentUserdata | null;
	setLoginOpen: (open: boolean) => void;
	userRank: number;
}

const RankCard: React.FC<RankCardProps> = ({ currentUser, currentUserdata, setLoginOpen, userRank }) => {
	const { resolvedTheme: theme } = useTheme();
	return (
		<div>
			<div className='relative mt-5 rounded-xxl text-[13px]'>
				<p className='absolute left-1/2 top-3 z-10 -translate-x-1/2 transform text-[14px] font-bold text-[#243A57]'>Rank {userRank ?? '#00'}</p>
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
									<NameLabel
										defaultAddress={currentUser?.defaultAddress}
										username={currentUser?.username}
										usernameClassName='text-lg text-ellipsis overflow-hidden'
										truncateUsername={true}
									/>
								</div>
								<div className='flex items-center gap-4'>
									<ScoreTag
										className='  pt-1'
										score={currentUserdata?.profile_score || 0}
									/>
								</div>
							</div>
						) : (
							<div className='absolute bottom-4 left-0 right-0 flex justify-center'>
								<p className='text-center font-poppins text-[16px] font-semibold text-[#243A57] dark:text-white'>
									<span
										onClick={() => setLoginOpen(true)}
										className='cursor-pointer text-[#E5007A] underline'
									>
										Login
									</span>{' '}
									to see your rank.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default RankCard;
