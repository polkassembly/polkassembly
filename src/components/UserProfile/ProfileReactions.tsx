// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { DownArrowIcon, ProfileReactionsIcon } from '~src/ui-components/CustomIcons';
import { ProfileDetailsResponse } from '~src/auth/types';
import { Checkbox, Popover, Spin } from 'antd';
import Address from '~src/ui-components/Address';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { poppins } from 'pages/_app';
import { DislikeFilled, LikeOutlined } from '@ant-design/icons';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ProposalType } from '~src/global/proposalType';
import { Pagination } from '~src/ui-components/Pagination';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { useTheme } from 'next-themes';
import ActivityBottomContent from './ProfileActivityBottom';

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
}

export enum EUserActivityType {
	REACTED = 'REACTED',
	COMMENTED = 'COMMENTED',
	REPLIED = 'REPLIED',
	MENTIONED = 'MENTIONED'
}

export enum EUserActivityIn {
	POST = 'POST',
	COMMENT = 'COMMENT',
	REPLY = 'REPLY'
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

const ProfileReactions = ({ className, userProfile }: Props) => {
	const { network } = useNetworkSelector();
	const { addresses, user_id } = userProfile;
	const { resolvedTheme: theme } = useTheme();
	const { id: userId } = useUserDetailsSelector();
	const [addressDropdownExpand, setAddressDropdownExpand] = useState(false);
	const [userActivities, setUserActivities] = useState<IProfileReactions[]>([]);
	const [checkedAddressesList, setCheckedAddressesList] = useState<CheckboxValueType[]>(addresses as CheckboxValueType[]);
	const [page, setPage] = useState<number>(1);
	const [count, setCount] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);

	const getData = async () => {
		if (isNaN(user_id)) return;
		setLoading(true);
		const { data, error } = await nextApiClientFetch<{ data: IProfileReactions[]; totalCount: number }>('/api/v1/users/reactions', {
			page: page,
			userId: user_id
		});
		if (data) {
			setUserActivities(data?.data);
			setCount(data?.totalCount || 0);
			console.log(data);
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

	const content = (
		<div className='flex flex-col'>
			<Checkbox.Group
				className='flex max-h-48 flex-col overflow-y-auto'
				onChange={(list) => setCheckedAddressesList(list)}
				value={checkedAddressesList}
			>
				{addresses?.map((address, index) => (
					<div
						className={`${poppins.variable} ${poppins.className} flex gap-3 p-2 text-sm tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high`}
						key={index}
					>
						<Checkbox
							className='text-pink_primary'
							value={address}
						/>
						<Address
							address={address}
							isTruncateUsername={false}
							displayInline
							disableAddressClick
							disableTooltip
						/>
					</div>
				))}
			</Checkbox.Group>
		</div>
	);

	return (
		<Spin
			spinning={loading}
			className='min-h-38'
		>
			<div
				className={classNames(
					className,
					'min-h-32 mt-6 flex flex-col gap-5 rounded-[14px] border-[1px] border-solid border-[#D2D8E0] bg-white px-4 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
				)}
			>
				<div className={`flex items-center justify-between gap-4 max-md:px-0 ${addresses.length > 1 && 'max-md:flex-col'}`}>
					<div className='flex items-center gap-2 text-xl font-medium max-md:justify-start'>
						<ProfileReactionsIcon className='text-2xl text-lightBlue dark:text-[#9e9e9e]' />
						<div className='flex items-center gap-1 text-bodyBlue dark:text-white'>Reactions</div>
					</div>
					<div className='flex gap-4'>
						{addresses.length > 1 && (
							<div>
								<Popover
									destroyTooltipOnHide
									zIndex={1056}
									content={content}
									placement='bottom'
									onOpenChange={() => setAddressDropdownExpand(!addressDropdownExpand)}
								>
									<div className='flex h-10 w-[180px] items-center justify-between rounded-md border-[1px] border-solid border-[#DCDFE3] px-3 py-2 text-sm font-medium capitalize text-lightBlue dark:border-separatorDark dark:text-blue-dark-medium'>
										Select Addresses
										<span className='flex items-center'>
											<DownArrowIcon className={`cursor-pointer text-2xl ${addressDropdownExpand && 'pink-color rotate-180'}`} />
										</span>
									</div>
								</Popover>
							</div>
						)}
					</div>
				</div>
				<div className='flex  flex-col gap-6'>
					{userActivities.map((activity, index) => {
						return (
							<div key={index}>
								{activity.type === EUserActivityType.REACTED && (
									<div className='flex  items-start gap-5'>
										<span className={`flex rounded-full border-[1px] border-solid p-3 ${activity.reaction == '👍' ? 'border-pink_primary bg-pink_primary' : 'border-[#FF3C5F]'} `}>
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
										<div className='flex  flex-col gap-1'>
											<div className='flex items-center gap-2'>
												<span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>{activity.author}</span>
												<span className='text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>reacted</span>
												{activity.reaction == '👍' ? (
													<span className='flex items-center gap-2 text-pink_primary'>
														<LikeOutlined className='text-base' /> Aye
													</span>
												) : (
													<span className='flex items-center gap-2 text-[#FF3C5F]'>
														<DislikeFilled className='mt-0.5 text-base' />
														Nay
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
							</div>
						);
					})}
				</div>
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
			</div>
		</Spin>
	);
};
export default ProfileReactions;
