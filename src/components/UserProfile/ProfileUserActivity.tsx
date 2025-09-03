// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { CommentsIcon, MyActivityIcon } from '~src/ui-components/CustomIcons';
import { ProfileDetailsResponse } from '~src/auth/types';
import { Divider, Spin } from 'antd';
import ImageComponent from '../ImageComponent';
import { DislikeFilled, LikeOutlined } from '@ant-design/icons';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ProposalType } from '~src/global/proposalType';
import Link from 'next/link';
import { Pagination } from '~src/ui-components/Pagination';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { useTheme } from 'next-themes';
import ActivityBottomContent from './ProfileActivityBottom';
import { EActivityFilter, EUserActivityIn, EUserActivityType } from '~src/types';
import Select from '~src/basic-components/Select';
import { dmSans } from 'pages/_app';
import ImageIcon from '~src/ui-components/ImageIcon';

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
	count: number;
}

type IReaction = '👍' | '👎';

export interface IUserActivityTypes {
	mentions?: string[];
	postTitle: string;
	postId: number | string;
	createdAt: Date;
	postType: ProposalType;
	content: string;
	reaction: IReaction;
	type: EUserActivityType;
	activityIn: EUserActivityIn;
	commentId: string;
}

const ProfileUserActivity = ({ className, userProfile }: Props) => {
	const { network } = useNetworkSelector();
	const { addresses, user_id: profileUserId, username } = userProfile;
	const { id: userId } = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();
	const [userActivities, setUserActivities] = useState<IUserActivityTypes[]>([]);
	const [page, setPage] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [filter, setFilter] = useState<EActivityFilter>(EActivityFilter.ALL);
	const [totalCount, setTotalCount] = useState<number>(0);

	const getData = async () => {
		if (profileUserId === null || profileUserId === undefined || isNaN(profileUserId)) return;

		setLoading(true);
		const { data, error } = await nextApiClientFetch<{ data: IUserActivityTypes[]; totalCount: number }>('/api/v1/users/user-activities', {
			filterBy: filter === EActivityFilter.ALL ? null : filter,
			page: page,
			userId: profileUserId
		});
		if (data) {
			setUserActivities(data?.data);
			setLoading(false);
			setTotalCount(data?.totalCount);
		} else if (error) {
			console.log(error);
			setLoading(false);
			setTotalCount(0);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, page, profileUserId, filter]);

	return (
		<Spin
			spinning={loading}
			className='min-h-[280px]'
		>
			<div
				className={classNames(
					className,
					'mt-6 flex min-h-[280px] flex-col gap-5 rounded-[14px] border-[1px] border-solid border-section-light-container bg-white p-4 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col sm:p-6'
				)}
			>
				<div className={`flex items-center justify-between gap-4 max-md:px-0 ${addresses.length > 1 && 'max-md:flex-col'}`}>
					<div className='flex items-center gap-2 text-xl font-medium max-md:justify-start'>
						<MyActivityIcon className='text-xl text-lightBlue dark:text-[#9e9e9e]' />
						<div className='flex items-center gap-1 text-bodyBlue dark:text-white'>My Activity</div>
						<span className='text-sm font-normal'>({totalCount})</span>
					</div>
					<div>
						<Select
							value={filter}
							className={classNames('w-[140px] capitalize', dmSans.className, dmSans.variable)}
							onChange={(e) => {
								setFilter(e);
								setPage(1);
							}}
							options={[EActivityFilter.ALL, EActivityFilter.COMMENTS, EActivityFilter.REPLIES, EActivityFilter.MENTIONS, EActivityFilter.REACTS].map((option) => {
								return {
									label: <span className={classNames(dmSans.className, dmSans.variable, 'text-sm capitalize tracking-[0.0015em]')}>{option.toLowerCase()}</span>,
									value: option
								};
							})}
						>
							{filter?.toLowerCase()}
						</Select>
					</div>
				</div>
				<div className='mt-2 flex flex-col pb-10'>
					{userActivities?.length
						? userActivities.map((activity, index) => {
								return (
									<div key={index}>
										{activity.type === EUserActivityType.MENTIONED && (
											<div className='flex items-start gap-5 font-normal'>
												<ImageComponent
													alt='profile img'
													src={userProfile.image}
													className='flex h-10 w-10 items-center justify-center'
												/>
												<div className='flex w-full flex-col gap-1'>
													<div className='flex items-center gap-2'>
														<span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>{profileUserId !== userId ? username : 'You'}</span>
														<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>mentioned</span>
														<div className='flex gap-2'>
															{!!activity?.mentions &&
																activity?.mentions?.map((username, index) => (
																	<Link
																		key={username}
																		href={`/user/${username}`}
																		target='_blank'
																		className='text-sm font-medium'
																	>
																		@{username}
																		{(activity?.mentions?.length || 0) - 1 !== index && ','}
																	</Link>
																))}
														</div>
														<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>in</span>
													</div>
													<ActivityBottomContent activity={activity} />
												</div>
											</div>
										)}
										{activity.type === EUserActivityType.REACTED && (
											<div className='flex items-start gap-3 sm:gap-5'>
												<span
													className={`flex rounded-full border-[1px] border-solid p-1.5 sm:p-3 ${
														activity.reaction == '👍' ? 'border-pink_primary bg-pink_primary' : 'border-[#FF3C5F]'
													} `}
												>
													{activity.reaction == '👍' ? (
														<>
															<LikeOutlined className='text-sm text-white' />
														</>
													) : (
														<>
															<DislikeFilled className='text-sm text-[#FF3C5F]' />
														</>
													)}
												</span>
												<div className='flex w-full flex-col gap-1'>
													<div className='flex items-center gap-2'>
														<span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>{profileUserId !== userId ? username : 'You'}</span>
														<span className='text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>reacted</span>
														{activity.reaction == '👍' ? (
															<span className='flex items-center gap-1 text-xs text-pink_primary sm:gap-2 sm:text-base'>
																<LikeOutlined className='text-base' /> Liked
															</span>
														) : (
															<span className='flex items-center gap-1 text-xs text-[#FF3C5F] sm:gap-2 sm:text-base'>
																<DislikeFilled className='mt-0.5 text-base' />
																Disliked
															</span>
														)}
													</div>
													<ActivityBottomContent activity={activity} />
												</div>
											</div>
										)}
										{[EUserActivityType.COMMENTED, EUserActivityType.REPLIED].includes(activity.type) && (
											<div className='flex items-start gap-5'>
												<span className={'flex rounded-full border-[1px] border-solid border-pink_primary p-3'}>
													<CommentsIcon className='text-pink_primary' />
												</span>
												<div className='flex w-full flex-col gap-1'>
													<div className='flex items-center gap-2'>
														<span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>{profileUserId !== userId ? username : 'You'}</span>
														<span className='text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>
															added a {activity?.type === EUserActivityType.COMMENTED ? 'comment' : 'reply'} on
														</span>
													</div>
													<ActivityBottomContent activity={activity} />
												</div>
											</div>
										)}
										{userActivities.length - 1 !== index && (
											<div className='-mx-6'>
												<Divider
													type='horizontal'
													className='bg-[#D2D8E0B2] dark:bg-separatorDark'
												/>
											</div>
										)}
									</div>
								);
							})
						: !loading && (
								<div className='my-[60px] flex flex-col items-center gap-6'>
									<ImageIcon
										src={theme == 'light' ? '/assets/EmptyStateLight.svg' : '/assets/EmptyStateDark.svg '}
										alt='Empty Icon'
										imgClassName='w-[225px] h-[225px]'
									/>
									<h3 className='text-blue-light-high dark:text-blue-dark-high'>No current activities</h3>
								</div>
							)}
				</div>
				<div className='flex items-center justify-center'>
					{!!userActivities?.length && (
						<Pagination
							theme={theme}
							defaultCurrent={1}
							pageSize={LISTING_LIMIT}
							total={totalCount}
							showSizeChanger={false}
							hideOnSinglePage={true}
							onChange={(page: number) => {
								setPage(page);
							}}
							responsive={true}
						/>
					)}
				</div>
			</div>
		</Spin>
	);
};
export default ProfileUserActivity;
