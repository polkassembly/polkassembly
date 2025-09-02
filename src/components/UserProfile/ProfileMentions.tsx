// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { ProfileMentionsIcon } from '~src/ui-components/CustomIcons';
import { ProfileDetailsResponse } from '~src/auth/types';
import { Divider, Spin } from 'antd';
import ImageComponent from '../ImageComponent';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ProposalType } from '~src/global/proposalType';
import Link from 'next/link';
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

export interface IProfileMentions {
	by: string;
	mentions?: string[];
	postTitle: string;
	postId: number | string;
	createdAt: Date;
	postType: ProposalType;
	content: string;
	type: EUserActivityType;
	activityIn: EUserActivityIn;
	commentId: string;
}
const ProfileMentions = ({ className, userProfile, count }: Props) => {
	const { network } = useNetworkSelector();
	const { addresses, user_id } = userProfile;
	const { id: userId } = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();
	const [userMentions, setUserMentions] = useState<IProfileMentions[]>([]);
	const [page, setPage] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);

	const getData = async () => {
		if (isNaN(user_id)) return;
		setLoading(true);
		const { data, error } = await nextApiClientFetch<{ data: IProfileMentions[]; totalCount: number }>('/api/v1/users/mentions', {
			page: page,
			userId: user_id
		});
		if (data) {
			setUserMentions(data?.data);
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
					'mt-6 flex min-h-[280px] flex-col gap-5 rounded-[14px] border-[1px] border-solid border-section-light-container bg-white p-4 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col sm:p-6'
				)}
			>
				<div className={`flex items-center justify-between gap-4 max-md:px-0 ${addresses.length > 1 && 'max-md:flex-col'}`}>
					<div className='flex items-center gap-2 text-xl font-medium max-md:justify-start'>
						<ProfileMentionsIcon className='text-2xl text-lightBlue dark:text-[#9e9e9e]' />
						<div className='flex items-center gap-1 text-bodyBlue dark:text-white'>Mentions</div>
						<span className='text-sm font-normal'>({count})</span>
					</div>
				</div>
				<div className='mt-2 flex flex-col pb-6'>
					{userMentions.length
						? userMentions.map((activity, index) => {
								return (
									<div key={index}>
										{activity.type === EUserActivityType.MENTIONED && (
											<div className='flex items-start gap-5 font-normal'>
												<ImageComponent
													alt='profile img'
													src={userProfile.image}
													className='flex h-[40px] w-[40px] items-center justify-center'
												/>
												<div className='flex w-full flex-col gap-1'>
													<div className='flex items-center gap-2'>
														<Link
															key={activity?.by}
															href={`/user/${activity?.by}`}
															target='_blank'
															className='text-sm font-medium'
														>
															@{activity?.by}
														</Link>
														<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>
															mentioned {userProfile.user_id === userId ? 'you' : `@${userProfile.username}`} in
														</span>
													</div>
													<ActivityBottomContent activity={activity} />
												</div>
											</div>
										)}
										{userMentions.length - 1 !== index && (
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
									<h3 className='text-blue-light-high dark:text-blue-dark-high'>No mentions found</h3>
								</div>
							)}
				</div>

				<div className='flex items-center justify-center'>
					{!!userMentions?.length && (
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
export default ProfileMentions;
