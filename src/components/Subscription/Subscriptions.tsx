// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { EReferendumType, IPostHistory, PostLink } from '~src/types';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ClockCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { ProposalType, getSinglePostLinkFromProposalType } from '~src/global/proposalType';
import Loader from '~src/ui-components/Loader';
import { useNetworkSelector } from '~src/redux/selectors';
import { getProposalTypesForNetwork } from '~src/util/GetProposalTypeFromNetwork';
import Alert from '~src/basic-components/Alert';
import { Dropdown } from '~src/ui-components/Dropdown';
import { useTheme } from 'next-themes';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { DownOutlined } from '@ant-design/icons';
import { Empty } from 'antd';
interface Timestamp {
	_seconds: number;
	_nanoseconds: number;
}
interface Post {
	user_id: number;
	content: string;
	created_at: Timestamp;
	id: number | string;
	isDeleted: boolean;
	last_edited_at: Date;
	last_comment_at: Date;
	title: string;
	topic_id: number;
	proposer_address: string;
	post_link: PostLink | null;
	username?: string;
	gov_type?: 'gov_1' | 'open_gov';
	proposalHashBlock?: string | null;
	tags?: string[] | [];
	history?: IPostHistory[];
	subscribers?: number[];
	summary?: string;
	createdOnPolkassembly?: boolean;
	inductee_address?: string;
	typeOfReferendum?: EReferendumType;
}

interface IUserData {
	[key: string]: Post[];
}
interface UserSubscriptionsResponse {
	data?: {
		subscribedPosts: Post[];
	};
	error?: string;
}

const capitalizeFirstLetter = (string: String) => {
	return string
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
};

const Subscriptions = () => {
	const { network } = useNetworkSelector();
	const [userData, setUserData] = useState<IUserData>({});
	const [selectedProposalType, setSelectedProposalType] = useState<string>('referendums_v2');
	const [loading, setLoading] = useState<boolean>(true);
	const allProposalTypes = getProposalTypesForNetwork(network);

	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		const fetchSubscriptions = async () => {
			setLoading(true);
			const response = (await nextApiClientFetch('/api/v1/users/user-subscriptions', {
				proposalType: selectedProposalType
			})) as UserSubscriptionsResponse;
			if (response.data && Array.isArray(response.data.subscribedPosts)) {
				setUserData({ ...userData, [selectedProposalType]: response.data.subscribedPosts });
			}
			if (response.error) console.log(response.error);
			setLoading(false);
		};

		fetchSubscriptions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedProposalType, network]);

	const proposalTypeItems = allProposalTypes.map((proposalType) => ({
		key: proposalType.type,
		label: capitalizeFirstLetter(proposalType.type),
		onClick: () => setSelectedProposalType(proposalType.type)
	}));

	const displayedPosts = selectedProposalType ? userData[selectedProposalType] : [];

	return (
		<div className={''}>
			<Alert
				type='info'
				showIcon
				message={<span className='text-blue-light-medium dark:text-[#9E9E9E]'>This is a place to keep track of Subscribed posts.</span>}
				className='my-2 border-none dark:bg-infoAlertBgDark'
			/>
			<div className='mt-5 flex flex-col pb-6'>
				<div className='flex items-center justify-between'>
					<span className='text-xl font-medium'>Posts</span>
					<Dropdown
						menu={{ items: proposalTypeItems }}
						trigger={['click']}
						theme={theme}
						placement={'bottomRight'}
					>
						<CustomButton className='w-min'>
							<div className='flex items-center gap-2'>
								{capitalizeFirstLetter(selectedProposalType)}
								<DownOutlined className='align-middle text-pink_primary' />
							</div>
						</CustomButton>
					</Dropdown>
				</div>
				{loading ? (
					<div className='mx-auto flex space-x-2'>
						<Loader />
						<span className='text-pink_primary'>Loading Please wait</span>
					</div>
				) : (
					<>
						{displayedPosts && displayedPosts.length > 0 ? (
							displayedPosts.map((post) => (
								<div
									className='mt-6 flex w-full items-start justify-between'
									key={post.id}
								>
									<div className='flex'>
										<div className='w-min px-2 font-semibold'>#{post.id}</div>
										<div className='flex justify-between space-x-1'>
											<span>{post.title}</span>
											<span className='-mt-[1px]'>
												<Link
													href={`/${getSinglePostLinkFromProposalType(selectedProposalType as ProposalType)}/${post.id}`}
													// href={`/referenda}/${post.id}`}
													target='_blank'
												>
													<Image
														src='/assets/icons/redirect.svg'
														alt=''
														height={16}
														width={16}
													/>
												</Link>
											</span>
										</div>
									</div>
									{post.created_at && (
										<div>
											<ClockCircleOutlined className='mr-1' />
											{getRelativeCreatedAt(new Date(post.created_at._seconds * 1000))}
										</div>
									)}
								</div>
							))
						) : (
							<Empty className='mt-10 dark:text-[#9e9e9e]' />
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default Subscriptions;
