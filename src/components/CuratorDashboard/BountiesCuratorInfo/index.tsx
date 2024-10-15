// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { spaceGrotesk } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import BN from 'bn.js';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { childBountyStatus } from '~src/global/statuses';
import Address from '~src/ui-components/Address';
import Link from 'next/link';
import { Spin } from 'antd';
import Image from 'next/image';
import Skeleton from '~src/basic-components/Skeleton';

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

function BountiesCuratorInfo() {
	const currentUser = useUserDetailsSelector();
	const address = currentUser?.loginAddress;
	const [expandedBountyId, setExpandedBountyId] = useState<number | null>(null);
	const { network } = useNetworkSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingChildBounties, setLoadingChildBounties] = useState<{ [key: number]: boolean }>({});
	const [curatedBounties, setCuratedBounties] = useState<Bounty[]>();

	const fetchCuratorBounties = async () => {
		setLoading(true);
		const { data } = await nextApiClientFetch<any>('/api/v1/bounty/curator/getAllCuratedBountiesAndChildBounties', {
			page: 1,
			userAddress: address
		});
		if (data) setCuratedBounties(data?.bounties);
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
			if (bounty.childBounties === undefined) {
				setLoadingChildBounties((prevState) => ({ ...prevState, [bounty?.index]: true }));
				const childBounties = await fetchChildBounties(bounty?.index, bounty?.curator);
				if (childBounties) {
					setCuratedBounties((prevBounties = []) => prevBounties?.map((curBounty) => (curBounty?.index === bounty?.index ? { ...curBounty, childBounties } : curBounty)));
				}
				setLoadingChildBounties((prevState) => ({ ...prevState, [bounty?.index]: false }));
			}
		}
	};

	useEffect(() => {
		fetchCuratorBounties();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			className={`${spaceGrotesk.className} ${spaceGrotesk.variable} rounded-lg border-[1px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]`}
		>
			<p className='text-[24px] font-bold text-blue-light-high dark:text-lightWhite'>Bounties Curated {curatedBounties?.length && <>({curatedBounties?.length})</>} </p>
			{loading ? (
				<>
					<Skeleton active />
				</>
			) : (
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
								<div className=' flex justify-end text-[12px] font-semibold text-gray-500'>
									<span className='rounded-t-lg border-t-[1px] border-solid border-t-[#DF1380] bg-[#FFF0FF] p-2'>{percentage?.toNumber()?.toFixed(1)}% Claimed</span>
								</div>

								<div className={`rounded-lg border-solid ${expandedBountyId === bounty?.index ? 'border-[1px] border-[#E5007A]' : 'border-[0.7px] border-[#D2D8E0]'} bg-white p-3`}>
									<div className='flex items-center justify-between gap-3'>
										<div className=' flex gap-1'>
											<span className='text-[17px] font-medium text-blue-light-medium'>#{bounty?.index} </span>
											<Link href={`/bounty/${bounty?.index}`}>
												<span className='text-[17px] font-medium text-blue-light-high hover:underline'>
													{bounty.title}
													<Image
														src='/assets/more.svg'
														alt=''
														style={{
															filter: 'brightness(0) saturate(100%) invert(33%) sepia(14%) saturate(1156%) hue-rotate(174deg) brightness(102%) contrast(92%)'
														}}
														width={18}
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
													{expandedBountyId === bounty.index ? (
														<UpOutlined
															style={{
																background: 'linear-gradient(264.95deg, #333333 19.45%, #0A0A0A 101.3%)'
															}}
															className='rounded-full p-2 text-white'
														/>
													) : (
														<DownOutlined
															style={{
																background: 'linear-gradient(264.95deg, #333333 19.45%, #0A0A0A 101.3%)'
															}}
															className='rounded-full p-2 text-white'
														/>
													)}
												</div>
											)}
										</div>
									</div>

									{expandedBountyId === bounty?.index && bounty?.totalChildBountiesCount > 0 && (
										<div className='ml-4 mt-2'>
											{loadingChildBounties[bounty?.index] ? (
												<div className='mt-2 flex justify-center'>
													<Spin />
												</div>
											) : (
												bounty?.childBounties?.map((childBounty) => (
													<div
														key={childBounty?.index}
														className='mt-3 flex flex-col justify-between rounded-lg border-[0.7px] border-solid border-[#D2D8E0] bg-[#F7F8FA] p-3'
													>
														<div className='flex items-center gap-3'>
															<span className='text-[18px] text-blue-light-medium'>#{childBounty?.index} </span>
															<Link href={`/child_bounty/${childBounty?.index}`}>
																<span className='text-[18px] font-medium text-blue-light-high hover:underline'>
																	{childBounty?.title}{' '}
																	<Image
																		src='/assets/more.svg'
																		alt=''
																		style={{
																			filter: 'brightness(0) saturate(100%) invert(33%) sepia(14%) saturate(1156%) hue-rotate(174deg) brightness(102%) contrast(92%)'
																		}}
																		width={16}
																		height={16}
																	/>{' '}
																</span>
															</Link>
														</div>
														<div className='mt-2 flex items-center justify-center gap-3 rounded-lg border-[1px] border-solid border-[#129F5D] bg-[#E7F6EC] p-1'>
															<span className='text-[18px] font-bold text-[#129F5D]'>{parseBalance(String(childBounty?.reward || '0'), 2, true, network)}</span>
															<span className='flex items-center gap-3'>
																<span className='text-[#485F7D]'>Claimed By</span> <Address address={childBounty?.payee} />
															</span>
														</div>
													</div>
												))
											)}
										</div>
									)}
								</div>
							</div>
						);
					})}
				</>
			)}
		</div>
	);
}

export default BountiesCuratorInfo;
