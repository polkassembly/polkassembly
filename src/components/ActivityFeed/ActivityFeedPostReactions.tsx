// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Tooltip } from 'antd';
import classNames from 'classnames';

import { useNetworkSelector } from '~src/redux/selectors';
import { dmSans } from 'pages/_app';
import ImageComponent from '../ImageComponent';
import Popover from '~src/basic-components/Popover';

import DarkSentiment1 from '~assets/overall-sentiment/dark/dizzy(1).svg';
import DarkSentiment2 from '~assets/overall-sentiment/dark/dizzy(2).svg';
import DarkSentiment3 from '~assets/overall-sentiment/dark/dizzy(3).svg';
import DarkSentiment4 from '~assets/overall-sentiment/dark/dizzy(4).svg';
import DarkSentiment5 from '~assets/overall-sentiment/dark/dizzy(5).svg';
import SadDizzyIcon from '~assets/overall-sentiment/pink-against.svg';
import SadIcon from '~assets/overall-sentiment/pink-slightly-against.svg';
import NeutralIcon from '~assets/overall-sentiment/pink-neutral.svg';
import SmileIcon from '~assets/overall-sentiment/pink-slightly-for.svg';
import SmileDizzyIcon from '~assets/overall-sentiment/pink-for.svg';

export const EmojiOption = ({ icon, title, percentage }: { icon: React.ReactNode; title: string; percentage: number | null }) => (
	<Tooltip
		color='#363636'
		title={`${title}${percentage !== null ? ` - ${percentage}%` : ''}`}
		placement='top'
	>
		<div
			className='-mt-[10px] flex items-center justify-center gap-2 rounded-full border-none bg-transparent text-2xl transition-all duration-200 hover:scale-110'
			style={{ cursor: 'pointer' }}
		>
			{icon}
			{percentage !== null && <span className='text-[10px] text-[#d12274]'>{percentage}%</span>}
		</div>
	</Tooltip>
);

export const ActivityFeedPostReactions: React.FC<{
	reactionState: any;
	post: any;
}> = ({ reactionState, post }: { reactionState: any; post: any }) => {
	const { firstVoterProfileImg, commentsCount } = post;
	const username = reactionState?.likesUsernames?.[0] || '';
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;
	const displayUsername = !isMobile ? username : username.length > 5 ? `${username.slice(0, 5)}...` : username;
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();

	const renderUsernames = (reaction: '👍' | '👎') => {
		const usernames = reaction === '👍' ? reactionState?.likesUsernames : reactionState?.dislikesUsernames;
		const userImages = reaction === '👍' ? reactionState?.likesImages : reactionState?.dislikesImages;

		if (!Array.isArray(usernames) || usernames.length <= 1) {
			return <p className='pt-2 text-sm text-gray-400 dark:text-gray-500'>No reactions yet</p>;
		}

		return usernames?.slice(1)?.length ? (
			<div className={classNames('max-h-24 w-min overflow-y-auto pt-1', dmSans.className, dmSans.variable)}>
				{usernames?.slice(1)?.map((name: string, index: number) => (
					<Link
						href={`https://${network}.polkassembly.io/user/${name}`}
						key={index}
						target='_blank'
						className='mb-[6px] flex items-center gap-[6px]'
					>
						<ImageComponent
							src={userImages?.slice(1) && userImages?.slice(1)?.[index]}
							alt='User Picture'
							className='flex h-[20px] w-[20px] items-center justify-center bg-transparent'
							iconClassName='flex items-center justify-center text-[#FCE5F2] text-xxl w-full h-full rounded-full'
						/>
						<span className=' text-sm text-gray-600 dark:text-gray-300'>{name}</span>
					</Link>
				))}
			</div>
		) : (
			<p className='pt-2 text-sm text-gray-400 dark:text-gray-500'>No reactions yet</p>
		);
	};
	const percentage = Math?.min(post?.highestSentiment?.percentage || 0, 100);
	const sentimentLevels = [
		{ threshold: 20, title: 'Completely Against' },
		{ threshold: 40, title: 'Slightly Against' },
		{ threshold: 60, title: 'Neutral' },
		{ threshold: 80, title: 'Slightly For' },
		{ threshold: 100, title: 'Completely For' }
	];

	const sentimentTitle = sentimentLevels?.find((level) => percentage <= level?.threshold)?.title || 'Completely For';

	const renderSentimentIcon = (sentiment: number) => {
		const sentimentIcons: Record<number, React.ReactNode> = {
			0: theme === 'dark' ? <DarkSentiment1 /> : <SadDizzyIcon />,
			1: theme === 'dark' ? <DarkSentiment1 /> : <SadDizzyIcon />,
			2: theme === 'dark' ? <DarkSentiment2 /> : <SadIcon />,
			3: theme === 'dark' ? <DarkSentiment3 /> : <NeutralIcon />,
			4: theme === 'dark' ? <DarkSentiment4 /> : <SmileIcon />,
			5: theme === 'dark' ? <DarkSentiment5 /> : <SmileDizzyIcon />
		};

		return sentimentIcons[sentiment] || null;
	};

	return (
		<div className='-mt-2 flex items-center  justify-between text-sm text-gray-500 dark:text-[#9E9E9E]'>
			<div>
				{reactionState?.likesCount > 0 && reactionState?.likesUsernames?.length > 0 && (
					<div className='mt-1 flex items-center'>
						<ImageComponent
							src={firstVoterProfileImg}
							alt='User Picture'
							className='flex h-[20px] w-[20px] items-center justify-center bg-transparent'
							iconClassName='flex items-center justify-center text-[#FCE5F2] text-xxl w-full h-full rounded-full'
						/>
						<div className='ml-1 text-[10px] md:ml-2 md:pt-5 md:text-[12px]'>
							{reactionState?.likesCount === 1 ? (
								<p className='md:-mt-2'>{`${displayUsername} has liked this post`}</p>
							) : (
								<Popover
									placement='bottom'
									trigger='hover'
									content={renderUsernames('👍')}
									arrow={true}
								>
									<p className='cursor-pointer text-[10px] md:-mt-2 md:text-[12px]'>
										{`${displayUsername} & `}
										<span className='text-pink_primary underline'>{`${reactionState?.likesCount - 1} others`}</span>
										{' liked this post'}
									</p>
								</Popover>
							)}
						</div>
					</div>
				)}
			</div>

			<div className='flex items-center gap-1 md:gap-3'>
				<p className='whitespace-nowrap text-[10px] text-gray-600 dark:text-[#9E9E9E] md:text-[12px] '>{commentsCount || 0} Comments</p>
				{post?.highestSentiment?.sentiment > 0 && <p className='block pt-1 text-blue-light-medium dark:text-[#9E9E9E]  lg:hidden'>|</p>}
				<div className='block lg:hidden'>
					<div className='mt-2 flex items-center space-x-1 md:mt-5'>
						{post?.highestSentiment?.sentiment >= 0 && (
							<EmojiOption
								icon={renderSentimentIcon(post?.highestSentiment?.sentiment)}
								title={sentimentTitle}
								percentage={percentage}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
