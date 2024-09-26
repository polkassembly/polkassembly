// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Tooltip } from 'antd';
import { useTheme } from 'next-themes';
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
import ImageComponent from '../ImageComponent';

const FIRST_VOTER_PROFILE_IMG_FALLBACK = '/assets/rankcard3.svg';

export const EmojiOption = ({ icon, title, percentage }: { icon: React.ReactNode; title: string; percentage: number | null }) => {
	return (
		<Tooltip
			color='#363636'
			title={`${title}${percentage ? ` - ${percentage}%` : ''}`}
			placement='top'
		>
			<div
				className='-mt-[10px] flex items-center justify-center gap-2 rounded-full border-none bg-transparent text-2xl transition-all duration-200 hover:scale-110'
				style={{ cursor: 'pointer' }}
			>
				{icon} {percentage ? <span className='text-[10px] text-[#d12274]'>{percentage}%</span> : ''}
			</div>
		</Tooltip>
	);
};

export const PostReactions: React.FC<{
	likes: { count: number; usernames: string[] };
	dislikes: { count: number; usernames: string[] };
	post: any;
}> = ({ likes, dislikes, post }: { likes: { count: number; usernames: string[] }; dislikes: { count: number; usernames: string[] }; post: any }) => {
	const { firstVoterProfileImg, comments_count } = post;
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;
	const username = likes?.usernames?.[0] || '';
	const displayUsername = !isMobile ? username : username.length > 5 ? `${username.slice(0, 5)}...` : username;
	const { resolvedTheme: theme } = useTheme();
	return (
		<div className='flex items-center justify-between  text-sm text-gray-500 dark:text-[#9E9E9E]'>
			<div>
				{likes.count > 0 && likes?.usernames?.length > 0 && (
					<div className='flex items-center'>
						<ImageComponent
							src={firstVoterProfileImg || FIRST_VOTER_PROFILE_IMG_FALLBACK}
							alt='Voter Profile'
							className='h-6 w-6 rounded-full'
						/>
						<p className='text-[10px] md:ml-2 md:pt-5 md:text-[12px]'>
							{likes.count > 0 && (
								<div>
									<p>{likes.count === 1 ? `${displayUsername} has liked this post` : `${displayUsername} & ${likes.count - 1} others liked this post`}</p>
								</div>
							)}{' '}
						</p>
					</div>
				)}
			</div>

			<div className='flex items-center gap-1 md:gap-3'>
				<p className='whitespace-nowrap text-[10px] text-gray-600 dark:text-[#9E9E9E] md:text-[12px] '>{dislikes.count} dislikes</p>
				<p className='pt-1 text-[#485F7D] dark:text-[#9E9E9E]'>|</p>
				<p className='whitespace-nowrap text-[10px] text-gray-600 dark:text-[#9E9E9E] md:text-[12px] '>{comments_count || 0} Comments</p>
				{post?.highestSentiment?.sentiment > 0 && <p className='block pt-1 text-[#485F7D] dark:text-[#9E9E9E]  lg:hidden'>|</p>}
				<div className='block  lg:hidden'>
					<div className='mt-2 flex items-center space-x-1 md:mt-5'>
						{(post?.highestSentiment?.sentiment == 0 || post?.highestSentiment?.sentiment == 1) && (
							<EmojiOption
								icon={
									theme === 'dark' ? (
										<DarkSentiment1 style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									) : (
										<SadDizzyIcon style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									)
								}
								title={'Completely Against'}
								percentage={post?.highestSentiment?.percentage || null}
							/>
						)}
						{post?.highestSentiment?.sentiment == 2 && (
							<EmojiOption
								icon={
									theme === 'dark' ? (
										<DarkSentiment2 style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									) : (
										<SadIcon style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									)
								}
								title={'Slightly Against'}
								percentage={post?.highestSentiment?.percentage || null}
							/>
						)}
						{post?.highestSentiment?.sentiment == 3 && (
							<EmojiOption
								icon={
									theme === 'dark' ? (
										<DarkSentiment3 style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									) : (
										<NeutralIcon style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									)
								}
								title={'Neutral'}
								percentage={post?.highestSentiment?.percentage || null}
							/>
						)}
						{post?.highestSentiment?.sentiment == 4 && (
							<EmojiOption
								icon={
									theme === 'dark' ? (
										<DarkSentiment4 style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									) : (
										<SmileIcon style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									)
								}
								title={'Slightly For'}
								percentage={post?.highestSentiment?.percentage || null}
							/>
						)}
						{post?.highestSentiment?.sentiment == 5 && (
							<EmojiOption
								icon={
									theme === 'dark' ? (
										<DarkSentiment5 style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									) : (
										<SmileDizzyIcon style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									)
								}
								title={'Completely For'}
								percentage={post?.highestSentiment?.percentage || null}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
