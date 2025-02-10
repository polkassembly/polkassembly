// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Popover } from 'antd';
import Image from 'next/image';
import { dmSans, spaceGrotesk } from 'pages/_app';
import { useNetworkSelector } from '~src/redux/selectors';
import { IChildBountiesResponse } from '~src/types';
// import { BountyCriteriaIcon, CuratorIcon } from '~src/ui-components/CustomIcons';
import { CuratorIcon } from '~src/ui-components/CustomIcons';
import ImageIcon from '~src/ui-components/ImageIcon';
import getAscciiFromHex from '~src/util/getAscciiFromHex';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ImageComponent from '../ImageComponent';
import Link from 'next/link';
import Skeleton from '~src/basic-components/Skeleton';
import { useTheme } from 'next-themes';
import CuratorPopover from './utils/CuratorPopover';
import { chainProperties } from '~src/global/networkConstants';
import styled from 'styled-components';
import { getFormattedValue } from './utils/formatBalanceUsd';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import { IDelegationProfileType } from '~src/auth/types';
import { removeSymbols } from '~src/util/htmlDiff';
import useTokenPrice from '~src/hooks/useTokenPrice';

const CardHeader = styled.div`
	&:after {
		content: '';
		position: absolute;
		bottom: 0px;
		right: -30px;
		height: 30px;
		width: 30px;
		border-bottom-left-radius: 100%;
		border-left: 1px solid ${(props: any) => (props.theme === 'dark' ? '#3b444f' : '#d2d8e0')} !important;
		box-shadow: -9px 9px 0 4px ${(props: any) => (props.theme === 'dark' ? '#141416' : '#fff')} !important;
	}
`;

const HotBountyCard = ({ extendedData }: { extendedData: any }) => {
	const { network } = useNetworkSelector();
	const { tokenPrice, tokenLoading } = useTokenPrice();
	const { post_id, title, content, tags, reward, user_id, curator, proposer, description } = extendedData;
	const [childBountiesCount, setChildBountiesCount] = useState<number>(0);
	const { resolvedTheme: theme } = useTheme();
	const [loading, setLoading] = useState(false);
	const unit = chainProperties?.[network]?.tokenSymbol;
	const [profileDetails, setProfileDetails] = useState<IDelegationProfileType>({
		bio: '',
		image: '',
		social_links: [],
		user_id: 0,
		username: ''
	});

	const getData = async () => {
		try {
			const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${proposer}`, undefined, 'GET');
			if (error || !data || !data.username || !data.user_id) {
				return;
			}
			setProfileDetails({
				bio: data?.profile?.bio || '',
				image: data?.profile?.image || '',
				social_links: data?.profile?.social_links || [],
				user_id: data?.user_id,
				username: data?.username
			});
		} catch (error) {
			console.log(error);
		}
	};

	const getChildBounties = async () => {
		const { data, error } = await nextApiClientFetch<IChildBountiesResponse>('/api/v1/child_bounties/getAllChildBounties', {
			parentBountyIndex: post_id
		});
		if (data) {
			setChildBountiesCount(data.child_bounties_count);
		}
		if (error) {
			console.log('error', error);
		}
	};

	useEffect(() => {
		if (!network) return;
		setProfileDetails({
			bio: '',
			image: '',
			social_links: [],
			user_id: 0,
			username: ''
		});
		const fetchData = async () => {
			setLoading(true);
			await getChildBounties();
			await getData();
			setLoading(false);
		};
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [post_id, user_id, network, proposer]);

	return (
		<section className='mx-3 flex w-full items-center justify-between md:w-[383px]'>
			{loading ? (
				<Skeleton active />
			) : (
				<>
					<div className='w-full sm:w-[340px] xl:w-[383px]'>
						<Link
							key={post_id}
							href={`/bounty/${post_id}`}
							target='_blank'
						>
							<div className='flex w-full'>
								<CardHeader
									theme={theme as any}
									className='relative flex h-[56px] w-[90%] items-center gap-x-3 rounded-t-3xl border-b-0 border-l border-r border-t border-solid border-section-light-container bg-white px-3 pt-5 dark:border-section-dark-container dark:bg-section-light-overlay'
								>
									<div className='flex items-baseline gap-x-2'>
										<h2 className='mt-4 font-pixeboy text-[35px] font-normal text-pink_primary'>
											{tokenLoading || isNaN(Number(tokenPrice)) ? '' : '$'}
											{tokenPrice && getFormattedValue(String(reward), network, tokenPrice, tokenLoading)}
										</h2>
										<span className=' font-pixeboy text-[24px] font-normal text-pink_primary'>{tokenLoading || isNaN(Number(tokenPrice)) ? `${unit}` : ''}</span>
									</div>
								</CardHeader>
								<Link
									key={post_id}
									href={`/bounty/${post_id}`}
									target='_blank'
									className='px-2'
								>
									<Image
										src={theme === 'light' ? '/assets/bounty-icons/redirect-icon.svg' : '/assets/bounty-icons/redirect-icon-black.svg'}
										width={44}
										height={44}
										alt='redirect link'
										className='-mr-[2px] mt-[6px] cursor-pointer rounded-full bg-black dark:bg-white'
									/>
								</Link>
							</div>
							<div
								className={
									'rounded-tr-2xl border-b border-l border-r border-t-0 border-solid border-section-light-container bg-white px-3 py-1 dark:border-section-dark-container dark:bg-section-light-overlay'
								}
							>
								<Link
									href={`/bounty/${post_id}`}
									target='_blank'
								>
									<ImageIcon
										src='/assets/bounty-icons/bounty-image.svg'
										alt='bounty icon'
										imgClassName='mt-5 mb-3 w-full'
										imgWrapperClassName=''
									/>
								</Link>
								<div className={`${spaceGrotesk.className} ${spaceGrotesk.variable} h-7 overflow-y-auto`}>
									<span className='mr-1 text-base font-medium text-blue-light-medium dark:text-blue-dark-medium'>#{post_id}</span>
									<span className='text-lg font-bold text-blue-light-high dark:text-blue-dark-high'> {title.length <= 28 ? title : `${title.slice(0, 28)}...`}</span>
								</div>

								<div
									className={`${spaceGrotesk.className} ${spaceGrotesk.variable} scroll-hidden mb-2 h-[40px] overflow-y-auto break-words text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium`}
								>
									{content ? removeSymbols(content).slice(0, 90) : getAscciiFromHex(description).slice(0, 90)}...
								</div>
								<div className='h-7'>
									{tags && tags.length > 0 && (
										<div className='flex gap-x-1'>
											{tags?.slice(0, 3).map((tag: string, index: number) => (
												<div
													key={index}
													className='w-min rounded-xl border-[1px] border-solid border-section-light-container px-[14px] py-[4px] text-[10px] font-medium text-lightBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-high'
												>
													{tag}
												</div>
											))}
										</div>
									)}
								</div>
								<div className='my-1 flex h-[22px] items-center justify-between'>
									<div>
										{profileDetails?.username && (
											<Link
												href={`/address/${proposer}`}
												target='_blank'
											>
												<ImageComponent
													alt='user img'
													src={profileDetails.image}
													className='-mt-[2px] mr-[2px] h-[17px] w-[17px]'
												/>
												<span className={`${dmSans.variable} ${dmSans.className} text-sm font-medium text-blue-light-high dark:text-blue-dark-high`}>
													{profileDetails?.username.length <= 12 ? profileDetails.username : `${profileDetails.username.slice(0, 12)}...`}
												</span>
											</Link>
										)}
									</div>
									<div className={'cursor-pointer'}>
										{curator && (
											<Popover
												content={<CuratorPopover address={curator} />}
												title=''
												placement='top'
											>
												<div className='flex items-center rounded-md p-1 hover:bg-[#f5f5f5] dark:hover:bg-section-dark-garyBackground'>
													<CuratorIcon className='-mt-[2px] text-blue-light-medium dark:text-blue-dark-medium ' />
													<button
														className={`cursor-pointer ${spaceGrotesk.className} ${spaceGrotesk.variable} border-none bg-transparent px-[5px] py-[2px] text-xs font-medium text-blue-light-medium dark:text-blue-dark-medium `}
													>
														Curator
													</button>
												</div>
											</Popover>
										)}
									</div>
								</div>
							</div>
							<Link
								key={post_id}
								href={`/bounty/${post_id}`}
								target='_blank'
								className='flex w-full items-center justify-between rounded-b-3xl bg-[#343434] p-4 text-white'
							>
								<div className={`${spaceGrotesk.className} ${spaceGrotesk.variable} -ml-1 flex cursor-pointer items-center gap-2 `}>
									<Image
										src={'/assets/bounty-icons/child-bounty-icon.svg'}
										width={16}
										height={16}
										alt='curator'
									/>
									<span className='text-[13px] font-medium text-white'>Child Bounties:</span>
									<span className='text-[13px] font-medium text-white'>{childBountiesCount}</span>
								</div>
								<div className='cursor-pointer '>
									<Image
										src={'/assets/bounty-icons/arrow-icon.svg'}
										width={16}
										height={16}
										alt='arrow'
									/>
								</div>
							</Link>
						</Link>
					</div>
				</>
			)}
		</section>
	);
};

export default HotBountyCard;
