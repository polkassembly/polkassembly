// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Divider, Popover } from 'antd';
import Image from 'next/image';
import { poppins, spaceGrotesk } from 'pages/_app';
import { UserProfileImage } from 'pages/api/v1/auth/data/getUsersProfileImages';
import { useNetworkSelector } from '~src/redux/selectors';
import { IChildBountiesResponse } from '~src/types';
import { BountyCriteriaIcon, CuratorIcon } from '~src/ui-components/CustomIcons';
import ImageIcon from '~src/ui-components/ImageIcon';
import getAscciiFromHex from '~src/util/getAscciiFromHex';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ImageComponent from '../ImageComponent';
import Link from 'next/link';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import Skeleton from '~src/basic-components/Skeleton';
import { useTheme } from 'next-themes';
import CuratorPopover from './utils/CuratorPopover';
import BN from 'bn.js';
import { chainProperties } from '~src/global/networkConstants';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import NameLabel from '~src/ui-components/NameLabel';
import { getFormattedValue } from './utils/formatBalanceUsd';

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

const ClaimedAmountPieGraph = dynamic(() => import('./utils/ClaimedAmountPieGraph'), { ssr: false });

const HotBountyCard = ({ extendedData }: { extendedData: any }) => {
	const { network } = useNetworkSelector();
	const { post_id, title, description, tags, reward, user_id, curator, proposer } = extendedData;
	const [childBountiesCount, setChildBountiesCount] = useState<number>(0);
	const { resolvedTheme: theme } = useTheme();
	const [userImageData, setUserImageData] = useState<UserProfileImage[]>([]);
	const [currentTokenPrice, setCurrentTokenPrice] = useState({
		isLoading: true,
		value: ''
	});
	const [loading, setLoading] = useState(false);
	const [percentageClaimed, setPercentageClaimed] = useState<number>(0);
	const unit = chainProperties?.[network]?.tokenSymbol;

	const getChildBounties = async () => {
		const { data, error } = await nextApiClientFetch<IChildBountiesResponse>('/api/v1/child_bounties/getAllChildBounties', {
			parentBountyIndex: post_id
		});
		if (data) {
			setChildBountiesCount(data.child_bounties_count);

			if (data.child_bounties_count > 0) {
				const totalChildRewards = data.child_bounties.reduce((sum, childBounty) => sum.add(new BN(childBounty.reward)), new BN(0));
				const totalReward = new BN(reward);
				const claimedPercentage = totalChildRewards.muln(100).div(totalReward).toNumber();
				setPercentageClaimed(claimedPercentage);
			} else {
				setPercentageClaimed(0);
			}
		}
		if (error) {
			console.log('error', error);
		}
	};

	const getUserProfile = async (userIds: string[]) => {
		if (userIds?.length) {
			const { data, error } = await nextApiClientFetch<UserProfileImage[]>('api/v1/auth/data/getUsersProfileImages', { userIds });
			if (data) {
				setUserImageData(data);
			} else {
				console.log('There is error in fetching data', error);
			}
		} else {
			setUserImageData([]);
		}
	};

	useEffect(() => {
		if (!network) return;
		GetCurrentTokenPrice(network, setCurrentTokenPrice);
		const fetchData = async () => {
			setLoading(true);
			await getChildBounties();
			await getUserProfile([user_id]);
			setLoading(false);
		};
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [post_id, user_id, network]);

	return (
		<section className='w-full md:w-[383px]'>
			{loading ? (
				<Skeleton active />
			) : (
				<>
					<div className='w-full md:w-[383px]'>
						<div className='flex w-full'>
							<CardHeader
								theme={theme as any}
								className='relative flex h-[56px] w-[90%] items-center gap-x-3 rounded-t-3xl border-b-0 border-l border-r border-t border-solid border-section-light-container bg-white px-3 pt-5 dark:border-section-dark-container dark:bg-section-light-overlay'
							>
								<div className='flex items-baseline gap-x-2'>
									<h2 className='mt-4 font-pixeboy text-[35px] font-normal text-pink_primary'>
										{currentTokenPrice.isLoading || isNaN(Number(currentTokenPrice.value)) ? '' : '$'}
										{getFormattedValue(String(reward), network, currentTokenPrice)}
									</h2>
									<span className=' font-pixeboy text-[24px] font-normal text-pink_primary'>
										{currentTokenPrice.isLoading || isNaN(Number(currentTokenPrice.value)) ? `${unit}` : ''}
									</span>
								</div>
								<Divider
									type='vertical'
									className='h-[30px] bg-section-light-container dark:bg-section-dark-container'
								/>
								<h2 className='mt-3 font-pixeboy text-[28px] font-normal  text-blue-light-high dark:text-blue-dark-high'>{percentageClaimed}%</h2>
								<ClaimedAmountPieGraph percentageClaimed={percentageClaimed} />
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
								href={`/referenda/${post_id}`}
								target='_blank'
							>
								<ImageIcon
									src='/assets/bounty-icons/bounty-image.svg'
									alt='bounty icon'
									imgClassName='mt-5 mb-3 w-full md:w-auto'
									imgWrapperClassName=''
								/>
							</Link>
							<div className={`${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
								<span className='mr-1 text-base font-medium text-blue-light-medium dark:text-blue-dark-medium'>#{post_id}</span>
								<span className='text-lg font-bold text-blue-light-high dark:text-blue-dark-high'>{title}</span>
							</div>
							<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium`}>
								{getAscciiFromHex(description).slice(0, 140)}
							</p>
							{tags && tags.length > 0 && (
								<div className='flex gap-x-1'>
									{tags?.slice(0, 3).map((tag: string, index: number) => (
										<div
											key={index}
											style={{ fontSize: '10px' }}
											className=' w-min rounded-xl border-[1px] border-solid border-section-light-container px-[14px] py-[4px] font-medium text-lightBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-high'
										>
											{tag}
										</div>
									))}
									{tags.length > 3 && (
										<span
											className='text-bodyBlue dark:text-blue-dark-high'
											style={{ background: '#D2D8E050', borderRadius: '20px', fontSize: '10px', padding: '4px 8px' }}
										>
											+{tags.length - 3}
										</span>
									)}
								</div>
							)}
							<div className='flex items-center justify-between'>
								{user_id == 1 ? (
									<NameLabel
										defaultAddress={proposer}
										className='text-xs'
									/>
								) : (
									<Link
										href={`/user/${userImageData[0]?.username}`}
										target='_blank '
									>
										<span className={`${poppins.variable} ${poppins.className} mr-1 text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium`}>Proposer:</span>
										<ImageComponent
											alt='user img'
											src={userImageData[0]?.image}
											className='-mt-[1px] mr-[1px] h-[16px] w-[16px]'
										/>
										<span className={`${poppins.variable} ${poppins.className} text-xs font-medium text-blue-light-high dark:text-blue-dark-high`}>
											{userImageData[0]?.username}
										</span>
									</Link>
								)}
								<div className={'flex cursor-pointer items-center '}>
									{curator && (
										<>
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
											<div className='mr-1 h-[5px] w-[5px] rounded-full bg-blue-light-medium dark:bg-blue-dark-medium'></div>
										</>
									)}
									<div className='flex items-center rounded-md p-1 hover:bg-[#f5f5f5] dark:hover:bg-section-dark-garyBackground'>
										<BountyCriteriaIcon className='-mt-[2px] text-blue-light-medium dark:text-blue-dark-medium ' />
										<button
											className={`cursor-pointer ${spaceGrotesk.className} ${spaceGrotesk.variable} border-none bg-transparent px-[5px] py-[2px] text-xs font-medium text-blue-light-medium dark:text-blue-dark-medium`}
										>
											Criteria
										</button>
									</div>
								</div>
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
				</>
			)}
		</section>
	);
};

export default HotBountyCard;
