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
import { Divider } from 'antd';
import moment from 'moment';
import { LoadingOutlined } from '@ant-design/icons';
import { IoMdTime } from 'react-icons/io';
import { GrLike } from 'react-icons/gr';
import { GrDislike } from 'react-icons/gr';
import { FaShareAlt } from 'react-icons/fa';
import { LiaCommentsSolid } from 'react-icons/lia';

const LatestActivityFollowing = ({ className, gov2LatestPosts }: { className?: string; gov2LatestPosts: any }) => {
	const [currentTab, setCurrentTab] = useState<string | null>('all');
	const [currentCategory, setCurrentCategory] = useState<string | null>(null);
	const [postData, setPostData] = useState<any[]>([]);
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const dropdownRef = useRef<HTMLDivElement | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [expandedPosts, setExpandedPosts] = useState<number[]>([]);
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
			if (error || !data || !data.profile?.image) {
				return null;
			}
			return data.profile.image;
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
				const detailedPosts = await Promise.all(
					posts.map(async (post: any) => {
						const proposalType = getProposalType(currentTab || 'all');
						const payload = {
							network,
							postId: post.motion || post.id,
							proposalType
						};

						const { data: postDetails, error: postError } = await nextApiClientFetch<any>('/api/v1/posts/on-chain-post', payload);
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
									profileimg: userData.profile.image
								};
							}
						} catch (error) {
							console.error('User profile fetch failed:', error);
						}
						let firstVoterProfileImg = null;
						if (postDetails?.post_reactions?.['👍']?.usernames?.[0]) {
							firstVoterProfileImg = await fetchVoterProfileImage(postDetails.post_reactions['👍'].usernames[0]);
						}

						return {
							...post,
							details: postDetails,
							proposerProfile: userProfile,
							firstVoterProfileImg
						};
					})
				);

				console.log('detailedPosts:', detailedPosts);

				setPostData(detailedPosts);
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
		</div>
	);
};

export default React.memo(LatestActivityFollowing);
