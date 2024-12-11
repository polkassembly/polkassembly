// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { dmSans, spaceGrotesk } from 'pages/_app';
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
import Address from '~src/ui-components/Address';
import { IBountyListing } from '~src/components/Bounties/BountiesListing/types/types';
import { IChildBounty } from '~src/types';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import SkeletonButton from '~src/basic-components/Skeleton/SkeletonButton';
import { useTranslation } from 'next-i18next';

const CreateChildBountyButton = dynamic(() => import('~src/components/ChildBountyCreation/CreateChildBountyButton'), {
	loading: () => <SkeletonButton active />,
	ssr: false
});

const ZERO_BN = new BN(0);

const BountiesCuratorInfo: FC<{ handleClick: (num: number) => void }> = ({ handleClick }) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const { loginAddress } = useUserDetailsSelector();
	const [expandedBountyId, setExpandedBountyId] = useState<number | null>(null);
	const { network } = useNetworkSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingChildBounties, setLoadingChildBounties] = useState<{ [key: number]: boolean }>({});
	const [curatedBounties, setCuratedBounties] = useState<IBountyListing[]>();
	const [totalBountiesCount, setTotalBountiesCount] = useState<number>(0);
	const { resolvedTheme: theme } = useTheme();

	const fetchCuratorBounties = async () => {
		setLoading(true);
		const { data } = await nextApiClientFetch<{ bounties: IBountyListing[]; totalBountiesCount: number }>('/api/v1/bounty/curator/getAllCuratedBountiesAndChildBounties', {
			page: router?.query?.page || 1,
			userAddress: loginAddress
		});
		if (data) {
			setCuratedBounties(data?.bounties);
			setTotalBountiesCount(data?.totalBountiesCount);
		}
		setLoading(false);
	};

	interface ChildBountiesResponse {
		child_bounties: IChildBounty[];
	}

	const fetchChildBounties = async (parentBountyIndex: number, curator: string): Promise<IChildBounty[]> => {
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

	const toggleChildBounties = async (bounty: IBountyListing) => {
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
			className={`${spaceGrotesk.className} ${spaceGrotesk.variable} rounded-lg border-[1px] border-solid border-section-light-container bg-white p-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]`}
		>
			<p className='text-2xl font-bold text-lightBlue dark:text-lightWhite'>
				{t('bounties_curated')} {curatedBounties && curatedBounties?.length > 0 ? <>({curatedBounties?.length})</> : <>(0)</>}{' '}
			</p>
			{loading ? (
				<>
					<Skeleton active />
				</>
			) : (
				<>
					{curatedBounties?.length ? (
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
										<div className=' flex justify-end text-xs font-bold text-bodyBlue'>
											<span className='rounded-t-lg border-b-0 border-t-[1px] border-solid border-t-[#DF1380] bg-[#FFF0FF] p-2 dark:bg-[#311B27] dark:text-[#DF1380]'>
												{percentage?.toNumber()?.toFixed(1)}% Claimed
											</span>
										</div>
										<div
											className={`rounded-lg border-solid ${
												expandedBountyId === bounty?.index ? 'border-[1px] border-pink_primary dark:border-pink_primary' : 'border-[0.7px] border-section-light-container'
											} bg-white p-3 dark:border-[#4B4B4B] dark:bg-[#0d0d0d]`}
										>
											<div className='flex items-center justify-between gap-3 py-1.5'>
												<div className='flex items-center gap-1'>
													<span
														className={`text-lg font-medium text-lightBlue hover:underline  ${
															expandedBountyId === bounty?.index ? 'dark:text-white' : 'dark:text-blue-dark-medium'
														}`}
													>
														#{bounty?.index}{' '}
													</span>
													<Link href={`/bounty/${bounty?.index}`}>
														<span
															className={`text-lg font-medium text-lightBlue hover:underline  ${
																expandedBountyId === bounty?.index ? 'dark:text-white' : 'dark:text-blue-dark-medium'
															}`}
														>
															{bounty?.title}
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
												<div className='flex items-center gap-3'>
													<span className='whitespace-nowrap text-[20px] font-bold text-pink_primary'>{parseBalance(String(bounty?.reward || '0'), 2, true, network)}</span>
													{!!bounty?.totalChildBountiesCount && (
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
																	className=' rounded-full p-2 text-white dark:text-blue-dark-medium'
																/>
															)}
														</div>
													)}
												</div>
											</div>

											{expandedBountyId === bounty?.index && !!bounty?.totalChildBountiesCount && (
												<div className='mx-3 mt-2'>
													{loadingChildBounties[bounty?.index] ? (
														<div className='mt-2 flex justify-center'>
															<Spin />
														</div>
													) : (
														bounty?.childBounties?.map((childBounty) => (
															<div
																key={childBounty?.index}
																className='mt-3 flex flex-col justify-between rounded-lg border-[0.7px] border-solid border-section-light-container bg-[#F7F8FA] p-3 dark:bg-[#303030] dark:text-blue-dark-medium'
															>
																<div className='flex items-start gap-5'>
																	<span className='text-base font-medium text-lightBlue dark:text-blue-dark-medium'>#{childBounty?.index} </span>
																	<Link href={`/child_bounty/${childBounty?.index}`}>
																		<div className='text-base font-medium text-lightBlue hover:underline dark:text-white'>
																			{childBounty?.title}
																			<Image
																				src='/assets/more.svg'
																				alt=''
																				className={classNames(theme === 'dark' ? 'dark-icons' : '', '-mt-1 ml-1')}
																				width={16}
																				height={16}
																			/>
																		</div>
																	</Link>
																</div>
																<div className='mt-2 flex items-center justify-center gap-3 rounded-lg border-[1px] border-solid border-[#129F5D] bg-[#E7F6EC] p-1 dark:bg-[#2c3d36]'>
																	<span className='text-lg font-bold text-[#129F5D]'>{parseBalance(String(childBounty?.reward || '0'), 2, true, network)}</span>
																	<span className='flex items-center gap-3'>
																		<span className='font-medium text-lightBlue dark:text-blue-dark-medium'>{t('claimed_by')}</span>
																		<Address
																			address={childBounty?.payee || ''}
																			displayInline
																		/>
																	</span>
																</div>
															</div>
														))
													)}
												</div>
											)}
											<div className='mx-3 mt-4 rounded-lg py-3 text-center'>
												<CreateChildBountyButton />
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
							<div className={`flex h-[650px] flex-col ${dmSans.className} ${dmSans.variable} items-center rounded-xl  px-5 pt-5  `}>
								<Image
									src='/assets/Gifs/find.gif'
									alt='empty state'
									className='m-0 h-96 w-96 p-0'
									width={350}
									height={350}
								/>
								<span className='-mt-10 text-xl font-semibold text-[#243A57] dark:text-white'>{t('no_bounties_curated_yet')}</span>
								<span className='pt-3 text-center text-[#243A57] dark:text-white'>
									<span
										onClick={() => {
											handleClick(1);
										}}
										className='cursor-pointer font-semibold text-pink_primary'
									>
										{t('create_bounty_proposals')}
									</span>{' '}
									{t('or_receive_requests')} <br /> {t('them_here')}
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
