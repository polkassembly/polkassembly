// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { poppins, spaceGrotesk } from 'pages/_app';
import React, { FC, useEffect, useState } from 'react';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import BN from 'bn.js';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { childBountyStatus } from '~src/global/statuses';
import Link from 'next/link';
import { Spin } from 'antd';
import Image from 'next/image';
import Skeleton from '~src/basic-components/Skeleton';
import { Pagination } from '~src/ui-components/Pagination';
import { BOUNTIES_LISTING_LIMIT } from '~src/global/listingLimit';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import NameLabel from '~src/ui-components/NameLabel';

const ZERO_BN = new BN(0);

interface Bounty {
	index: number;
	title: string;
	reward: number;
	curator: string;
	totalChildBountiesCount: number;
	childBounties: ChildBounty[];
	claimedAmount: number;
	payee: string;
	proposer: string;
	status: string;
}

interface ChildBounty {
	index: number;
	title: string;
	reward: number;
	payee: string;
}
const BountiesCuratorInfo: FC<{ handleClick: (num: number) => void }> = ({ handleClick }) => {
	const router = useRouter();
	const currentUser = useUserDetailsSelector();
	const address = currentUser?.loginAddress;
	const [expandedBountyId, setExpandedBountyId] = useState<number | null>(null);
	const { network } = useNetworkSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingChildBounties, setLoadingChildBounties] = useState<{ [key: number]: boolean }>({});
	const [curatedBounties, setCuratedBounties] = useState<Bounty[]>();
	const [totalBountiesCount, setTotalBountiesCount] = useState<number>(0);
	const { resolvedTheme: theme } = useTheme();

	const fetchCuratorBounties = async () => {
		setLoading(true);
		const { data } = await nextApiClientFetch<any>('/api/v1/bounty/curator/getAllCuratedBountiesAndChildBounties', {
			page: router?.query?.page || 1,
			userAddress: address
		});
		if (data) {
			setCuratedBounties(data?.bounties);
			setTotalBountiesCount(data?.totalBountiesCount);
		}
		setLoading(false);
	};

	interface ChildBountiesResponse {
		child_bounties: ChildBounty[];
	}

	const fetchChildBounties = async (parentBountyIndex: number, curator: string): Promise<ChildBounty[]> => {
		const { data, error } = await nextApiClientFetch<ChildBountiesResponse>('/api/v1/child_bounties/getAllChildBounties', {
			curator,
			parentBountyIndex,
			status: childBountyStatus.CLAIMED
		});

		if (error) {
			console.error('Error fetching child bounties:', error);
			return [];
		}

		return data?.child_bounties || [];
	};

	const toggleChildBounties = async (bounty: Bounty) => {
		if (expandedBountyId === bounty?.index) {
			setExpandedBountyId(null);
		} else {
			setExpandedBountyId(bounty?.index);
			if (bounty?.childBounties === undefined) {
				setLoadingChildBounties((prevState) => ({ ...prevState, [bounty?.index]: true }));
				const childBounties = await fetchChildBounties(bounty?.index, bounty?.curator);
				if (childBounties) {
					setCuratedBounties((prevBounties = []) => prevBounties?.map((curBounty) => (curBounty?.index === bounty?.index ? { ...curBounty, childBounties } : curBounty)));
				}
				setLoadingChildBounties((prevState) => ({ ...prevState, [bounty?.index]: false }));
			}
		}
	};
	const onPaginationChange = (page: number) => {
		router?.push({
			pathname: router?.pathname,
			query: {
				...router?.query,
				page
			}
		});
	};
	useEffect(() => {
		fetchCuratorBounties();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			className={`${spaceGrotesk.className} ${spaceGrotesk.variable} rounded-lg border-[1px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]`}
		>
			<p className='text-[24px] font-bold text-blue-light-high dark:text-lightWhite'>
				Bounties Curated {curatedBounties && curatedBounties?.length > 0 ? <>({curatedBounties?.length})</> : <>(0)</>}{' '}
			</p>
			{loading ? (
				<>
					<Skeleton active />
				</>
			) : (
				<>
					{curatedBounties && curatedBounties?.length > 0 ? (
						<>
							{curatedBounties?.map((bounty) => {
								const claimedBn = new BN(bounty?.claimedAmount || '0');
								const rewardBn = new BN(bounty?.reward || '0');

								const percentage = !rewardBn?.eq(ZERO_BN) ? claimedBn?.mul(new BN('100'))?.div(rewardBn) : ZERO_BN;

								return (
									<div
										key={bounty?.index}
										className='-mt-5'
									>
										<div className=' flex justify-end text-[12px] font-bold text-gray-500'>
											<span className='rounded-t-lg border-t-[1px] border-solid border-t-[#DF1380] bg-[#FFF0FF] p-2 dark:bg-[#311B27] dark:text-[#DF1380]'>
												{percentage?.toNumber()?.toFixed(1)}% Claimed
											</span>
										</div>
										<div
											className={`rounded-lg border-solid ${
												expandedBountyId === bounty?.index ? 'border-[1px] border-[#E5007A] dark:border-[#E5007A]' : 'border-[0.7px] border-[#D2D8E0]'
											} bg-white p-3 dark:border-[#4B4B4B] dark:bg-[#0d0d0d]`}
										>
											<div className='flex items-center justify-between gap-3'>
												<div className=' flex gap-1'>
													<span className='dark:text-icon-dark-inactiv text-[17px] font-medium text-blue-light-medium'>#{bounty?.index} </span>
													<Link href={`/bounty/${bounty?.index}`}>
														<span
															className={`text-[17px] font-medium text-blue-light-high hover:underline  ${
																expandedBountyId === bounty?.index ? 'dark:text-white' : 'dark:text-icon-dark-inactive'
															}`}
														>
															{bounty.title}
															<Image
																src='/assets/more.svg'
																alt=''
																style={{
																	filter:
																		theme === 'dark'
																			? 'brightness(0) saturate(100%) invert(69%) sepia(37%) saturate(0%) hue-rotate(249deg) brightness(86%) contrast(87%)'
																			: 'brightness(0) saturate(100%) invert(33%) sepia(14%) saturate(1156%) hue-rotate(174deg) brightness(102%) contrast(92%)'
																}}
																width={18}
																className='ml-1'
																height={18}
															/>{' '}
														</span>
													</Link>
												</div>
												<div className='-mt-4 flex items-center gap-3'>
													<span className='whitespace-nowrap text-[20px] font-bold text-pink_primary'>{parseBalance(String(bounty?.reward || '0'), 2, true, network)}</span>
													{bounty?.totalChildBountiesCount > 0 && (
														<div
															onClick={() => toggleChildBounties(bounty)}
															className='cursor-pointer'
														>
															{expandedBountyId === bounty?.index ? (
																<UpOutlined
																	style={{
																		background: theme == 'dark' ? '#4f4f4f' : 'linear-gradient(264.95deg, #333333 19.45%, #0A0A0A 101.3%)'
																	}}
																	className='rounded-full p-2 text-white'
																/>
															) : (
																<DownOutlined
																	style={{
																		background: theme == 'dark' ? '#4f4f4f' : 'linear-gradient(264.95deg, #333333 19.45%, #0A0A0A 101.3%)'
																	}}
																	className=' rounded-full p-2 text-white dark:text-icon-dark-inactive'
																/>
															)}
														</div>
													)}
												</div>
											</div>

											{expandedBountyId === bounty?.index && bounty?.totalChildBountiesCount > 0 && (
												<div className='mx-3 mt-2'>
													{loadingChildBounties[bounty?.index] ? (
														<div className='mt-2 flex justify-center'>
															<Spin />
														</div>
													) : (
														bounty?.childBounties?.map((childBounty) => (
															<div
																key={childBounty?.index}
																className='mt-3 flex flex-col justify-between rounded-lg border-[0.7px] border-solid border-[#D2D8E0] bg-[#F7F8FA] p-3 dark:bg-[#303030] dark:text-icon-dark-inactive'
															>
																<div className='flex items-center gap-3'>
																	<span className='text-[18px] text-blue-light-medium dark:text-icon-dark-inactive'>#{childBounty?.index} </span>
																	<Link href={`/child_bounty/${childBounty?.index}`}>
																		<span className='text-[18px] font-medium text-blue-light-high hover:underline dark:text-white'>
																			{childBounty?.title}{' '}
																			<Image
																				src='/assets/more.svg'
																				alt=''
																				style={{
																					filter:
																						theme === 'dark'
																							? 'brightness(0) saturate(100%) invert(69%) sepia(37%) saturate(0%) hue-rotate(249deg) brightness(86%) contrast(87%)'
																							: 'brightness(0) saturate(100%) invert(33%) sepia(14%) saturate(1156%) hue-rotate(174deg) brightness(102%) contrast(92%)'
																				}}
																				width={16}
																				height={16}
																			/>{' '}
																		</span>
																	</Link>
																</div>
																<div className='mt-2 flex items-center justify-center gap-3 rounded-lg border-[1px] border-solid border-[#129F5D] bg-[#E7F6EC] p-1 dark:bg-[#2c3d36]'>
																	<span className='text-[18px] font-bold text-[#129F5D]'>{parseBalance(String(childBounty?.reward || '0'), 2, true, network)}</span>
																	<span className='flex items-center gap-3'>
																		<span className='text-[#485F7D] dark:text-icon-dark-inactive'>Claimed By</span> <NameLabel defaultAddress={childBounty?.payee} />
																	</span>
																</div>
															</div>
														))
													)}
												</div>
											)}
											<div className='mx-3 mt-4 rounded-lg border-[1px] border-solid border-[#E5007A] py-3 text-center'>
												<span className='text-[18px] font-bold text-pink_primary'>
													<Image
														src='/assets/bounty-icons/child-bounty-icon.svg'
														alt='bounty icon'
														className='mr-1'
														style={{
															filter: 'brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%)'
														}}
														width={24}
														height={24}
													/>{' '}
													Create Child Bounty
												</span>
											</div>
										</div>
										<div className='mb-5 mt-3 flex justify-end'>
											{totalBountiesCount > BOUNTIES_LISTING_LIMIT && (
												<Pagination
													pageSize={BOUNTIES_LISTING_LIMIT}
													current={Number(router?.query?.page) || 1}
													total={totalBountiesCount}
													showSizeChanger={false}
													hideOnSinglePage={true}
													onChange={onPaginationChange}
													responsive={true}
													theme={theme}
												/>
											)}
										</div>
									</div>
								);
							})}
						</>
					) : (
						<>
							<div className={`flex h-[650px] flex-col ${poppins.className} ${poppins.variable} items-center rounded-xl  px-5 pt-5  `}>
								<Image
									src='/assets/Gifs/find.gif'
									alt='empty state'
									className='m-0 h-96 w-96 p-0'
									width={350}
									height={350}
								/>
								<span className='-mt-10 text-xl font-semibold text-[#243A57] dark:text-white'>No Bounties Curated Yet</span>
								<span className='pt-3 text-center text-[#243A57] dark:text-white'>
									<span
										onClick={() => {
											handleClick(1);
										}}
										className='cursor-pointer font-semibold text-pink_primary'
									>
										Create Bounty Proposals
									</span>{' '}
									or Receive curator requests to view <br /> them here
								</span>
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default BountiesCuratorInfo;
