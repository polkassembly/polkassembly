// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { ProfileReactionsIcon } from '~src/ui-components/CustomIcons';
import { ProfileDetailsResponse } from '~src/auth/types';
import { Divider, Spin } from 'antd';
import { DislikeFilled, LikeOutlined } from '@ant-design/icons';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ProposalType } from '~src/global/proposalType';
import { Pagination } from '~src/ui-components/Pagination';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { useTheme } from 'next-themes';
import ActivityBottomContent from './ProfileActivityBottom';
import { EUserActivityIn, EUserActivityType } from '~src/types';
import ImageIcon from '~src/ui-components/ImageIcon';

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
	count: number;
}

type IReaction = '👍' | '👎';

export interface IProfileReactions {
	author: string;
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

const ProfileReactions = ({ className, userProfile, count }: Props) => {
	const { network } = useNetworkSelector();
	const { addresses, user_id } = userProfile;
	const { resolvedTheme: theme } = useTheme();
	const { id: userId } = useUserDetailsSelector();
	const [userReactions, setUserReactions] = useState<IProfileReactions[]>([]);
	const [page, setPage] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);

	const getData = async () => {
		if (isNaN(user_id)) return;
		setLoading(true);
		const { data, error } = await nextApiClientFetch<{ data: IProfileReactions[]; totalCount: number }>('/api/v1/users/reactions', {
			page: page,
			userId: user_id
		});
		if (data) {
			setUserReactions(data?.data);
			setLoading(false);
		} else if (error) {
			console.log(error);
			setLoading(false);
		}
	};
	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, page, user_id]);

	return (
		<Spin
			spinning={loading}
			className='min-h-[280px]'
		>
			<div
				className={classNames(
					className,
					'mt-6 flex min-h-[280px] flex-col gap-5 rounded-[14px] border-[1px] border-solid border-section-light-container bg-white px-6 pb-6 pt-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
				)}
			>
				<div className={`flex items-center justify-between gap-4 max-md:px-0 ${addresses.length > 1 && 'max-md:flex-col'}`}>
					<div className='flex items-center gap-2 text-xl font-medium max-md:justify-start'>
						<ProfileReactionsIcon className='text-2xl text-lightBlue dark:text-[#9e9e9e]' />
						<div className='flex items-center gap-1 text-bodyBlue dark:text-white'>Reactions</div>
						<span className='text-sm font-normal'>({count})</span>
					</div>
				</div>
				<div className='mt-2 flex flex-col pb-6'>
					{userReactions?.length
						? userReactions.map((activity, index) => {
								return (
									<div key={index}>
										{activity.type === EUserActivityType.REACTED && (
											<div className='flex  items-start gap-5'>
												<span
													className={`flex rounded-full border-[1px] border-solid p-3 ${activity.reaction == '👍' ? 'border-pink_primary bg-pink_primary' : 'border-[#FF3C5F]'} `}
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
														<span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>{activity.author}</span>
														<span className='text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>reacted</span>
														{activity.reaction == '👍' ? (
															<span className='flex items-center gap-2 text-pink_primary'>
																<LikeOutlined className='text-base' /> Liked
															</span>
														) : (
															<span className='flex items-center gap-2 text-[#FF3C5F]'>
																<DislikeFilled className='mt-0.5 text-base' />
																Disliked
															</span>
														)}
														<span className='text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>
															on {userProfile.user_id === userId ? 'your' : `${userProfile.username}'s`} {activity.activityIn.toLowerCase()}
														</span>
													</div>
													<ActivityBottomContent activity={activity} />
												</div>
											</div>
										)}
										{userReactions.length - 1 !== index && (
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
									<h3 className='text-blue-light-high dark:text-blue-dark-high'>No reactions found</h3>
								</div>
						  )}
				</div>
				<div className='flex items-center justify-center'>
					{!!userReactions?.length && (
						<Pagination
							theme={theme}
							defaultCurrent={1}
							pageSize={LISTING_LIMIT}
							total={count}
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
export default ProfileReactions;
