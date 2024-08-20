// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useRef, useState } from 'react';
import { networkTrackInfo } from 'src/global/post_trackInfo';
import { useNetworkSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { DiscussionsIcon, FellowshipGroupIcon, GovernanceGroupIcon, OverviewIcon, StakingAdminIcon, TreasuryGroupIcon } from '~src/ui-components/CustomIcons';
import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import moment from 'moment';
import { LoadingOutlined } from '@ant-design/icons';
import { IoMdTime } from 'react-icons/io';
import { GrLike } from 'react-icons/gr';
import { GrDislike } from 'react-icons/gr';
import { FaShareAlt } from 'react-icons/fa';
import { LiaCommentsSolid } from 'react-icons/lia';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import Markdown from '~src/ui-components/Markdown';

const LatestActivityExplore = ({ className, gov2LatestPosts, currentUserdata }: { className?: string; gov2LatestPosts: any; currentUserdata?: any }) => {
	const [currentTab, setCurrentTab] = useState<string | null>('all');
	const [currentCategory, setCurrentCategory] = useState<string | null>(null);
	const [postData, setPostData] = useState<any[]>([]);
	const { network } = useNetworkSelector();
	const dropdownRef = useRef<HTMLDivElement | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [expandedPostId, setExpandedPostId] = useState<number | null>(null);

	const tabItems = [
		{
			key: 'all',
			label: 'All',
			posts: gov2LatestPosts.allGov2Posts?.data?.posts || []
		},
		{
			key: 'discussions',
			label: 'Discussions',
			posts: gov2LatestPosts.discussionPosts?.data?.posts || []
		}
	];

	if (network) {
		for (const trackName of Object.keys(networkTrackInfo[network])) {
			tabItems.push({
				key: trackName
					.split(/(?=[A-Z])/)
					.join('-')
					.toLowerCase(),
				label: trackName.split(/(?=[A-Z])/).join(' '),
				posts: gov2LatestPosts[trackName]?.data?.posts || []
			});
		}
	}

	const tabIcons: Record<string, JSX.Element> = {
		all: <OverviewIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		discussion: <DiscussionsIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		admin: <StakingAdminIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		governance: <GovernanceGroupIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		treasury: <TreasuryGroupIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		whitelist: <FellowshipGroupIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
	};

	const tabCategories: Record<string, string[]> = {
		All: ['all'],
		Discussion: ['discussions'],
		Admin: tabItems.filter((item) => item.key === 'staking-admin' || item.key === 'auction-admin').map((item) => item.key),
		Governance: tabItems.filter((item) => ['lease-admin', 'general-admin', 'referendum-canceller', 'referendum-killer'].includes(item.key)).map((item) => item.key),
		Treasury: tabItems
			.filter((item) => ['big-spender', 'medium-spender', 'small-spender', 'big-tipper', 'small-tipper', 'treasurer', 'on-chain-bounties', 'child-bounties'].includes(item.key))
			.map((item) => item.key),
		Whitelist: ['members', 'whitelisted-caller', 'fellowship-admin']
	};

	const getProposalType = (tabKey: string) => {
		if (tabKey === 'discussions') {
			return ProposalType.DISCUSSIONS;
		} else {
			return ProposalType.REFERENDUM_V2;
		}
	};

	const fetchVoterProfileImage = async (username: string) => {
		try {
			const { data, error } = await nextApiClientFetch<any>(`/api/v1/auth/data/userProfileWithUsername?username=${username}`);
			if (error || !data || !data?.image) {
				return null;
			}
			return data.image;
		} catch (error) {
			console.error('Error fetching voter profile image:', error);
			return null;
		}
	};
	const toPascalCase = (str: string) => {
		const specialCases: Record<string, string> = {
			all: 'allGov2Posts',
			discussions: 'discussionPosts'
		};
		if (specialCases[str]) {
			return specialCases[str];
		}

		return str
			.replace(/(\w)(\w*)/g, (g0, g1, g2) => {
				return g1.toUpperCase() + g2.toLowerCase();
			})
			.replace(/-./g, (match) => match.charAt(1).toUpperCase());
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);

				const pascalCaseTab = toPascalCase(currentTab || 'all');
				const posts = gov2LatestPosts[pascalCaseTab]?.data?.posts || [];
				const proposalType = getProposalType(currentTab || 'all');

				const detailedPosts = await Promise.all(
					posts.map(async (post: any) => {
						try {
							const postId = post?.post_id ? post.post_id.toString() : '';

							let { data: postDetails, error: postError } = await nextApiClientFetch<IPostResponse>(`api/v1/posts/off-chain-post?postId=${postId}&network=${network}`);

							if (!postDetails?.post_id || postError) {
								console.warn(`Off-chain fetch failed for post ID ${postId}. Trying on-chain fetch...`);

								const response = await fetch(`/api/v1/posts/activityposts?postId=${postId}&network=${network}&proposalType=${proposalType}`);
								const onChainPostDetails = await response.json();

								postDetails = onChainPostDetails.data;
								postError = onChainPostDetails.error;

								if (postError || !postDetails?.post_id) {
									console.error(`Error fetching details for post ID ${postId} from both endpoints`, postError);
									return { ...post, error: true };
								}
							}

							const proposerAddress = post.proposer;
							let userProfile = null;

							try {
								const { data: userData } = await nextApiClientFetch<IGetProfileWithAddressResponse>(
									`/api/v1/auth/data/profileWithAddress?address=${proposerAddress}`,
									undefined,
									'GET'
								);
								if (userData) {
									userProfile = {
										username: userData.username,
										user_id: userData.user_id,
										profileimg: userData.profile.image || '/rankcard3.svg'
									};
								}
							} catch (error) {
								console.error(`User profile fetch failed for proposer ${proposerAddress}:`, error);
							}

							let firstVoterProfileImg = null;
							if (postDetails?.post_reactions?.['👍']?.usernames?.[0]) {
								const username = postDetails.post_reactions['👍'].usernames[0];
								firstVoterProfileImg = await fetchVoterProfileImage(username);
							}

							return {
								...post,
								details: postDetails,
								proposerProfile: userProfile,
								firstVoterProfileImg
							};
						} catch (error) {
							console.error(`Error processing post ID ${post.post_id}:`, error);
							return { ...post, error: true };
						}
					})
				);

				const validPosts = detailedPosts.filter((post) => !post.error);
				setPostData(validPosts);
			} catch (err) {
				console.error('Error fetching data:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [currentTab, network, gov2LatestPosts]);

	const formatDate = (date: string) => {
		const now = moment();
		const postDate = moment(date);
		const diffInDays = now.diff(postDate, 'days');

		if (diffInDays < 1) {
			return postDate.fromNow();
		} else if (diffInDays >= 15) {
			return postDate.format('DD MMM YYYY');
		} else {
			return postDate.fromNow();
		}
	};

	const handleCategoryClick = (category: string) => {
		if (tabCategories[category].length > 1) {
			setCurrentCategory(currentCategory === category ? null : category);
		} else {
			setCurrentTab(tabCategories[category][0]);
			setCurrentCategory(null);
		}
	};

	const handleTabClick = (tabKey: string) => {
		setCurrentTab(tabKey);
		setCurrentCategory(null);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setCurrentCategory(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [dropdownRef]);

	const truncateContent = (content: string, wordLimit: number) => {
		const words = content.split(' ');
		if (words.length > wordLimit) {
			return words.slice(0, wordLimit).join(' ') + '...';
		}
		return content;
	};

	const toggleExpandPost = (postId: number) => {
		setExpandedPostId(expandedPostId === postId ? null : postId);
	};

	return (
		<div className=''>
			<div className='activityborder mb-5 flex justify-between rounded-lg bg-white pt-3'>
				{Object.keys(tabCategories).map((category) => (
					<div
						key={category}
						className={`relative flex px-5`}
					>
						<p
							className={`flex cursor-pointer items-center justify-between px-2 text-sm font-medium  ${
								currentTab === tabCategories[category][0] ? 'rounded-lg bg-[#F2F4F7] p-1 ' : ''
							}`}
							onClick={() => handleCategoryClick(category)}
						>
							<span className='flex items-center'>
								{tabIcons[category.toLowerCase()]}
								<span className='ml-2'>{category}</span>
							</span>
							{tabCategories[category].length > 1 && (
								<svg
									className='ml-2 h-2.5 w-2.5'
									aria-hidden='true'
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 10 6'
								>
									<path
										stroke='currentColor'
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='m1 1 4 4 4-4'
									/>
								</svg>
							)}
						</p>

						{currentCategory === category && tabCategories[category].length > 1 && (
							<div
								ref={dropdownRef}
								id='dropdown'
								className='absolute left-0 top-5 z-50 mt-2 w-44 divide-y divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700'
							>
								<ul className='py-2 text-sm text-gray-700 dark:text-gray-200'>
									{tabCategories[category].map((tabKey) => {
										const tabItem = tabItems.find((item) => item.key === tabKey);
										return (
											tabItem && (
												<p
													key={tabItem.key}
													className='block cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'
													onClick={() => handleTabClick(tabItem.key)}
												>
													<span className='flex items-center'>
														{tabIcons[tabItem.key.toLowerCase()]}
														<span className='ml-2'>
															{tabItem.label} ({tabItem.posts.length})
														</span>
													</span>
												</p>
											)
										);
									})}
								</ul>
							</div>
						)}
					</div>
				))}
			</div>

			{loading ? (
				<div className='flex min-h-[50px] w-full items-center justify-center'>
					<LoadingOutlined />
				</div>
			) : (
				<div className='w-[930px] space-y-4'>
					{postData.length === 0 ? (
						<p>No posts available</p>
					) : (
						postData.map((post: any, index: number) => {
							const postreaction = post?.details?.post_reactions || {};
							const dislikeCount = postreaction['👎'] ? postreaction['👎'].count : 0;
							let bgColor = 'bg-gray-500';
							let statusLabel = post.status || 'Active';

							if (post.status === 'Deciding') {
								bgColor = 'bg-[#D05704]';
							} else if (post.status === 'Submitted') {
								bgColor = 'bg-[#3866CE]';
							} else if (post.status === 'Executed') {
								bgColor = 'bg-[#2ED47A]';
							} else if (post.status === 'Rejected') {
								bgColor = 'bg-[#BD2020]';
							} else if (!post.status) {
								bgColor = 'bg-[#2ED47A]';
								statusLabel = 'Active';
							}
							const isExpanded = expandedPostId === post.post_id;
							const fullContent = post?.details?.content || 'No content available for this post.';
							const truncatedContent = truncateContent(fullContent, 50);
							const shouldShowReadMore = fullContent.length > truncatedContent.length;
							const postContent = isExpanded ? fullContent : truncatedContent;

							return (
								<div
									key={index}
									className='activityborder rounded-2xl bg-white p-8 font-poppins shadow-md'
								>
									<div className='flex justify-between'>
										<div className='flex gap-4'>
											<p className='text-2xl font-bold text-[#485F7D]'>{post.amount || '2500DOT'}</p>
											<div>
												<p className='rounded-lg bg-[#F3F4F6] p-2 text-[#485F7D]'>~ {post.usdValue || '$36k'}</p>
											</div>
											<div>
												<p className={`rounded-full p-2 text-white ${bgColor}`}>{statusLabel}</p>
											</div>
										</div>
										<div>
											<div className='castvoteborder  m-0 flex cursor-pointer items-center gap-1 p-0 px-3 text-[#E5007A]'>
												<img
													src='/Vote.svg'
													alt=''
													className='m-0 h-6 w-6 p-0'
												/>
												<p className='cursor-pointerfont-medium  pt-3'>Cast Vote</p>
											</div>
										</div>
									</div>
									<div className='flex items-center gap-2 pt-2'>
										<img
											src={post.proposerProfile?.profileimg || '/rankcard3.svg'}
											alt='profile'
											className='h-6 w-6 rounded-full'
										/>
										<p className='pt-3 text-sm font-medium text-[#243A57]'>{post.proposerProfile?.username || 'Anonymous'}</p>
										<span className='text-[#485F7D]'>in</span>
										<span className='rounded-lg bg-[#FCF1F4] p-2 text-sm text-[#EB5688]'>{post?.topic?.name || 'General'}</span>
										<p className=' pt-3 text-[#485F7D]'>|</p>
										<div className='flex gap-2'>
											<IoMdTime className='mt-3 h-5 w-5 text-[#485F7D]' />
											<p className=' pt-3 text-sm text-gray-500'>{formatDate(post.created_at)}</p>
										</div>
									</div>
									<p className='pt-2 font-medium text-[#243A57]'>
										#{post.title || '#45 Standard Guidelines to judge Liquidity Treasury Proposals on the main governance side - Kusama and Polkadot'}
									</p>
									<Markdown
										className='text-[#243A57]'
										md={postContent || 'No content available for this post.'}
										isPreview={!isExpanded}
									/>{' '}
									{shouldShowReadMore && (
										<p
											className='cursor-pointer font-medium text-[#1B61FF]'
											onClick={() => toggleExpandPost(post.post_id)}
										>
											{isExpanded ? 'Show Less' : 'Read More'}
										</p>
									)}
									<div className=' flex items-center justify-between text-sm text-gray-500'>
										<div>
											{postreaction['👍']?.usernames?.length > 0 && (
												<div className='flex items-center'>
													<img
														src={post.firstVoterProfileImg || '/rankcard3.svg'}
														alt='Voter Profile'
														className='h-5 w-5 rounded-full'
													/>
													<p className='ml-2 pt-3'>
														{postreaction['👍'].count === 1
															? `${postreaction['👍'].usernames[0]} has liked this post`
															: `${postreaction['👍'].usernames[0]} & ${postreaction['👍'].count - 1} others liked this post`}
													</p>
												</div>
											)}
										</div>
										<div className='flex gap-3'>
											<p className=' text-sm text-gray-600'>{dislikeCount} dislikes</p>
											<p className='  text-[#485F7D]'>|</p>
											<p className=' text-sm text-gray-600'>{post?.details?.comments_count || 0} Comments</p>
										</div>
									</div>
									<hr />
									<div className=' mt-1 flex items-center space-x-4'>
										<div className='flex  items-center gap-2'>
											<GrLike className='cursor-pointer text-[#E5007A]' />

											<p className='cursor-pointer pt-3 text-[#E5007A]'>Like</p>
										</div>
										<div className='flex items-center gap-2'>
											<GrDislike className='cursor-pointer text-[#E5007A]' />

											<p className=' cursor-pointer pt-3 text-[#E5007A]'>Like</p>
										</div>
										<div className='flex items-center gap-2'>
											<FaShareAlt className='cursor-pointer text-[#E5007A]' />

											<p className=' cursor-pointer pt-3 text-[#E5007A]'>Share</p>
										</div>
										<div className='flex items-center gap-2'>
											<LiaCommentsSolid className='cursor-pointer text-[#E5007A]' />

											<p className=' cursor-pointer pt-3 text-[#E5007A]'>Comment</p>
										</div>
									</div>
									<div className='mt-3 flex'>
										<img
											src={`${currentUserdata?.image ? currentUserdata?.image : '/rankcard3.svg'}`}
											alt=''
											className='h-10 w-10 rounded-full'
										/>
										<input
											type='text'
											placeholder='Type your comment here'
											className='activityborder2 ml-7 h-10 w-full rounded-l-lg p-2 outline-none'
										/>
										<button className='activityborder2 w-28 cursor-pointer rounded-r-lg bg-[#485F7D] bg-opacity-[5%] p-2 text-[#243A57] '>Post</button>
									</div>
								</div>
							);
						})
					)}
				</div>
			)}
		</div>
	);
};

export default React.memo(LatestActivityExplore);
