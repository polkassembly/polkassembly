// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { DownArrowIcon, ProfileMentionsIcon } from '~src/ui-components/CustomIcons';
import { ProfileDetailsResponse } from '~src/auth/types';
import { Checkbox, Divider, Empty, Popover, Spin } from 'antd';
import Address from '~src/ui-components/Address';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { poppins } from 'pages/_app';
import ImageComponent from '../ImageComponent';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ProposalType } from '~src/global/proposalType';
import Link from 'next/link';
import { Pagination } from '~src/ui-components/Pagination';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { useTheme } from 'next-themes';
import ActivityBottomContent from './ProfileActivityBottom';

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
	count: number;
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
	const [addressDropdownExpand, setAddressDropdownExpand] = useState(false);
	const [userMentions, setUserMentions] = useState<IProfileMentions[]>([]);
	const [checkedAddressesList, setCheckedAddressesList] = useState<CheckboxValueType[]>(addresses as CheckboxValueType[]);
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
			className='min-h-[280px]'
		>
			<div
				className={classNames(
					className,
					'mt-6 flex min-h-[280px] flex-col gap-5 rounded-[14px] border-[1px] border-solid border-[#D2D8E0] bg-white px-6 pt-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
				)}
			>
				<div className={`flex items-center justify-between gap-4 max-md:px-0 ${addresses.length > 1 && 'max-md:flex-col'}`}>
					<div className='flex items-center gap-2 text-xl font-medium max-md:justify-start'>
						<ProfileMentionsIcon className='text-2xl text-lightBlue dark:text-[#9e9e9e]' />
						<div className='flex items-center gap-1 text-bodyBlue dark:text-white'>Mentions</div>
						<span className='text-sm font-normal'>({count})</span>
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
				<div className='mt-2 flex flex-col pb-10'>
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
						: !loading && <Empty className='my-6 dark:text-[#9e9e9e]' />}
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
export default ProfileMentions;
