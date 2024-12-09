// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Checkbox, Popover } from 'antd';
import classNames from 'classnames';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { ProfileDetailsResponse } from '~src/auth/types';
import { dmSans } from 'pages/_app';
import Address from '~src/ui-components/Address';
import { useNetworkSelector } from '~src/redux/selectors';
import { EGovType, IUserPost, IUserPostsListingResponse } from '~src/types';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import styled from 'styled-components';
import Link from 'next/link';
import GovernanceCard from '../GovernanceCard';
import { getSinglePostLinkFromProposalType } from '~src/global/proposalType';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { ClipboardIcon, DownArrowIcon } from '~src/ui-components/CustomIcons';
import SelectGovType from './SelectGovType';
import { useTheme } from 'next-themes';
import ImageIcon from '~src/ui-components/ImageIcon';

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
	userPosts: IUserPostsListingResponse;
	totalPosts: number;
}
export const getLabel = (str: string) => {
	const newStr = str.split('_').join(' ');
	return newStr.charAt(0).toUpperCase() + newStr.slice(1);
};
const handleInitialFilter = (data: IUserPostsListingResponse, govType: EGovType) => {
	let filter = Object.keys(data?.[govType === EGovType.OPEN_GOV ? 'open_gov' : 'gov1'])?.[0];
	Object.entries(data?.[govType === EGovType.OPEN_GOV ? 'open_gov' : 'gov1']).map(([key, value]) => {
		if ((value as any)?.total || (value as any)?.length) {
			filter = key;
		}
	});
	return filter;
};
const getPosts = (filter: string, govType: EGovType, posts: IUserPostsListingResponse, addresses: string[], network: string) => {
	const newPosts =
		(posts as any)?.[govType === EGovType.OPEN_GOV ? 'open_gov' : 'gov1']?.[filter]?.posts || (posts as any)?.[govType === EGovType.OPEN_GOV ? 'open_gov' : 'gov1']?.[filter] || [];
	const filteredPosts =
		newPosts.filter((post: IUserPost) => addresses.map((address) => getEncodedAddress(address, network)).includes(getEncodedAddress(post?.proposer, network))) || [];

	return filteredPosts;
};

const ProfilePosts = ({ className, userPosts, userProfile, totalPosts }: Props) => {
	const { network } = useNetworkSelector();
	const { addresses } = userProfile;
	const [checkedAddressList, setCheckedAddressList] = useState<CheckboxValueType[]>(addresses as CheckboxValueType[]);
	const [addressDropdownExpand, setAddressDropdownExpand] = useState(false);
	const [subFilterExpand, setSubFilterExpand] = useState(false);
	const [selectedGov, setSelectedGov] = useState(isOpenGovSupported(network) ? EGovType.OPEN_GOV : EGovType.GOV1);
	const [selectedFilter, setSelectedFilter] = useState(handleInitialFilter(userPosts, selectedGov));
	const [posts, setPosts] = useState<IUserPost[]>(getPosts(selectedFilter, selectedGov, userPosts, checkedAddressList as string[], network));
	const [selectedSubFilters, setSelectedSubFilters] = useState((userPosts as any)?.[selectedGov === EGovType.OPEN_GOV ? 'open_gov' : 'gov1']?.[selectedFilter]);
	const [checkedSelectedSubFilters, setCheckedSelectedSubFilters] = useState<CheckboxValueType[]>(Object.keys(selectedSubFilters));
	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		setCheckedAddressList(addresses);
	}, [addresses]);

	const handleSelectSubFilter = (filter: string, govType: EGovType = selectedGov) => {
		const subFilter = (userPosts as any)?.[govType === EGovType.OPEN_GOV ? 'open_gov' : 'gov1']?.[filter];
		setSelectedSubFilters(subFilter);
		setCheckedSelectedSubFilters(Object.keys(subFilter));
	};

	const handleGovSelection = (govType: EGovType) => {
		if (govType === selectedGov) return;
		setSelectedGov(govType);
		const filter = handleInitialFilter(userPosts, govType);
		setSelectedFilter(filter);
		handleSelectSubFilter(filter, govType);
		setPosts(getPosts(filter, govType, userPosts, checkedAddressList as string[], network));
	};

	const handleFilterPostByPostType = (postTypes: string[]) => {
		const totalPosts: IUserPost[] = [];
		Object.entries(selectedSubFilters).map(([key, value]) => {
			if (postTypes.includes(key) && !!Array.isArray(value)) {
				if (value.length) {
					const filterByAddresses =
						value.filter((item) => checkedAddressList.map((add) => getEncodedAddress(add, network)).includes(getEncodedAddress(item?.proposer, network))) || [];
					totalPosts.push(...totalPosts, ...(filterByAddresses as any[]));
				}
			}
		});
		setPosts(totalPosts);
	};

	useEffect(() => {
		setPosts(getPosts(selectedFilter, selectedGov, userPosts, checkedAddressList as string[], network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [checkedAddressList]);

	const content = (
		<div className='flex flex-col'>
			<Checkbox.Group
				className='flex max-h-[200px] flex-col overflow-y-auto'
				onChange={(list) => setCheckedAddressList(list)}
				value={checkedAddressList}
			>
				{addresses?.map((address, index) => (
					<div
						className={`${dmSans.variable} ${dmSans.className} flex gap-3 p-2 text-sm tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high`}
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

	const subFilterContent = Object.keys(selectedSubFilters)?.length ? (
		<Checkbox.Group
			className='flex max-h-[200px] flex-col items-start justify-center overflow-y-auto'
			onChange={(list) => {
				setCheckedSelectedSubFilters(list);
				handleFilterPostByPostType(list as string[]);
			}}
			value={checkedSelectedSubFilters}
		>
			{Object.entries(selectedSubFilters).map(([key, value]) =>
				key === 'total' || key === 'posts' ? null : (
					<div
						className={`${dmSans.variable} ${dmSans.className} mt-2 flex items-center gap-3 px-2 text-xs tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high`}
						key={key}
					>
						<Checkbox
							className='text-pink_primary'
							value={key}
						/>
						{getLabel(key)}({(value as any)?.length || 0})
					</div>
				)
			)}
		</Checkbox.Group>
	) : null;
	return (
		<div
			className={classNames(
				className,
				'mt-6 flex flex-col gap-5 rounded-[14px] border-[1px] border-solid border-section-light-container bg-white px-6 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
			)}
		>
			<div className={`flex items-center justify-between gap-4 max-md:px-0 ${addresses.length > 1 && 'max-md:flex-col'}`}>
				<div className='flex w-full items-center gap-2 text-xl font-medium max-md:justify-start'>
					<ClipboardIcon className='text-[28px] text-lightBlue dark:text-[#9e9e9e]' />

					<div className='flex items-center gap-1 text-bodyBlue dark:text-white'>
						Posts
						<span className='flex items-end text-sm font-normal'>({totalPosts})</span>
					</div>
				</div>
				<div className='flex gap-4'>
					{addresses.length > 1 && (
						<div className=''>
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
					{isOpenGovSupported(network) && (
						<SelectGovType
							selectedGov={selectedGov}
							setSelectedGov={setSelectedGov}
							totalCount={totalPosts}
							onConfirm={handleGovSelection}
						/>
					)}
				</div>
			</div>
			<div className='flex flex-col gap-8 overflow-x-auto'>
				<div className='justify-between gap-2 sm:flex'>
					<div className='scroll-hidden flex w-auto gap-2 overflow-auto sm:w-auto sm:flex-shrink-0'>
						{Object.entries(selectedGov === EGovType.OPEN_GOV ? userPosts?.open_gov : userPosts?.gov1)?.map(([key, value]) => (
							<div
								key={key}
								onClick={() => {
									if (!((value as any)?.total || (value as any)?.length)) return;
									setSelectedFilter(key);
									handleSelectSubFilter(key, selectedGov);
									setPosts(getPosts(key, selectedGov, userPosts, checkedAddressList as string[], network));
								}}
								className={`flex-shrink-0 ${
									!((value as any)?.total || (value as any)?.length) ? 'cursor-not-allowed' : 'cursor-pointer'
								} rounded-[8px] border-[1px] border-solid px-3 py-1.5 text-xs font-normal capitalize tracking-wide text-bodyBlue dark:text-blue-dark-high ${
									selectedFilter == key ? 'border-[#3C74E1] bg-[#E2EAFB] dark:bg-infoAlertBgDark' : 'border-[#DCDFE3] dark:border-separatorDark'
								}`}
							>
								{getLabel(key)} {!((value as any)?.total || (value as any)?.length) ? '' : `(${(value as any)?.total || (value as any)?.length || 0})`}
							</div>
						))}
					</div>
					{!!subFilterContent && selectedFilter !== 'discussions' && (
						<div className='mt-3 sm:mt-0'>
							<Popover
								zIndex={1056}
								content={subFilterContent}
								placement='bottom'
								destroyTooltipOnHide
								onOpenChange={() => setSubFilterExpand(!subFilterExpand)}
							>
								<div className='flex h-8 w-[180px] items-center justify-between rounded-md border-[1px] border-solid border-[#DCDFE3] px-3 py-2 text-xs font-medium capitalize text-lightBlue dark:border-separatorDark dark:text-blue-dark-medium'>
									All
									<span className='flex items-center'>
										<DownArrowIcon className={`cursor-pointer text-2xl ${subFilterExpand && 'pink-color rotate-180'}`} />
									</span>
								</div>
							</Popover>
						</div>
					)}
				</div>
				<div className='max-h-[530px] overflow-y-auto pr-2'>
					{posts?.length ? (
						posts.map((post, index) => {
							return (
								<div
									key={post.id}
									className='my-0'
								>
									{
										<Link href={`/${getSinglePostLinkFromProposalType(post?.type)}/${post.id}`}>
											<GovernanceCard
												className={`${(index + 1) % 2 !== 0 && 'bg-[#FBFBFC] dark:bg-[#161616]'} ${dmSans.variable} ${dmSans.className}`}
												postReactionCount={post.post_reactions}
												address={post.proposer}
												commentsCount={post.comments_count || 0}
												onchainId={post.id}
												status={post.status}
												title={post.title}
												created_at={post.created_at}
												tags={post?.tags}
												tally={post?.tally}
												timeline={post?.timeline || []}
												statusHistory={(post?.status_history as any) || []}
												index={index}
												proposalType={post?.type}
												trackNumber={post?.track_number}
												assetId={post?.assetId || null}
												truncateUsername={false}
												requestedAmount={(post.requestedAmount || null) as any}
											/>
										</Link>
									}
								</div>
							);
						})
					) : (
						<div className='my-[60px] flex flex-col items-center gap-6'>
							<ImageIcon
								src={theme == 'light' ? '/assets/EmptyStateLight.svg' : '/assets/EmptyStateDark.svg '}
								alt='Empty Icon'
								imgClassName='w-[225px] h-[225px]'
							/>
							<h3 className='text-blue-light-high dark:text-blue-dark-high'>No Posts found</h3>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
export default styled(ProfilePosts)`
	.pink-color {
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	}
`;
