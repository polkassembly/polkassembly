// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Popover } from 'antd';
import Image from 'next/image';
import { poppins, spaceGrotesk } from 'pages/_app';
import { UserProfileImage } from 'pages/api/v1/auth/data/getUsersProfileImages';
import React, { useEffect, useState } from 'react';
import { useNetworkSelector } from '~src/redux/selectors';
import { IChildBountiesResponse } from '~src/types';
import { BountyCriteriaIcon, CuratorIcon } from '~src/ui-components/CustomIcons';
import ImageIcon from '~src/ui-components/ImageIcon';
import formatBnBalance from '~src/util/formatBnBalance';
import getAscciiFromHex from '~src/util/getAscciiFromHex';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ImageComponent from '../ImageComponent';
import Link from 'next/link';
import CuratorPopover from './utils/CuratorPopover';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';

const HotBountyCard = ({ extendedData }: { extendedData: any }) => {
	const { network } = useNetworkSelector();
	const { post_id, title, description, tags, reward, user_id, curator } = extendedData;
	const [childBountiesCount, setChilldBountiescount] = useState<number>(0);
	const [userImageData, setUserImageData] = useState<UserProfileImage[]>([]);
	const [currentTokenPrice, setCurrentTokenPrice] = useState({
		isLoading: true,
		value: ''
	});

	const getChildBounties = async () => {
		const { data, error } = await nextApiClientFetch<IChildBountiesResponse>('/api/v1/child_bounties/getAllChildBounties', {
			parentBountyIndex: post_id
		});
		if (data && data?.child_bounties_count) {
			setChilldBountiescount(data.child_bounties_count);
		}
		if (error) {
			console.log('error', error);
		}
	};

	const getUserProfile = async (userIds: string[]) => {
		if (userIds?.length) {
			const { data } = await nextApiClientFetch<UserProfileImage[]>('api/v1/auth/data/getUsersProfileImages', { userIds });
			if (data) {
				setUserImageData(data);
			} else {
				console.log('There is error in fetching data');
			}
		} else {
			setUserImageData([]);
		}
	};

	const getFormattedValue = (value: string) => {
		if (currentTokenPrice.isLoading || !currentTokenPrice.value) {
			return value;
		}
		const numericValue = Number(formatBnBalance(value, { numberAfterComma: 1, withThousandDelimitor: false }, network));
		const tokenPrice = Number(currentTokenPrice.value);
		const dividedValue = numericValue / tokenPrice;

		if (dividedValue >= 1e6) {
			return (dividedValue / 1e6).toFixed(2) + 'm';
		} else if (dividedValue >= 1e3) {
			return (dividedValue / 1e3).toFixed(2) + 'k';
		} else {
			return dividedValue.toFixed(2);
		}
	};

	useEffect(() => {
		getChildBounties();
		getUserProfile([user_id]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user_id, post_id]);

	useEffect(() => {
		if (!network) return;
		GetCurrentTokenPrice(network, setCurrentTokenPrice);
	}, [network]);

	return (
		<section className=' w-[383px] '>
			<div className=' w-[383px]'>
				<div className=' flex w-full'>
					<div className='flex h-[56px] w-[90%] items-center gap-x-3 rounded-t-3xl border-b-0 border-l border-r border-t border-solid border-section-light-container bg-white px-3 pt-5 dark:border-section-dark-container dark:bg-section-light-overlay'>
						<h2 className=' mt-4 text-[35px] font-normal text-pink_primary'>${getFormattedValue(String(reward))}</h2>
						<Divider
							type='vertical'
							className='h-[30px] bg-section-light-container dark:bg-section-dark-container'
						/>
						<h2 className=' mt-3 text-[22px] font-normal'>48%</h2>
					</div>
					<Link
						key={post_id}
						href={`/bounty/${post_id}`}
						target='_blank'
						className='px-3'
					>
						<Image
							src={'assets/bounty-icons/redirect-icon.svg'}
							width={44}
							height={44}
							alt='redirect link'
							className='-mr-[2px] mt-[6px] cursor-pointer rounded-full bg-black'
						/>
					</Link>
				</div>
				<div
					className={
						'rounded-tr-2xl border-b border-l border-r border-t-0  border-solid border-section-light-container bg-white px-3 py-1 dark:border-section-dark-container dark:bg-section-light-overlay'
					}
				>
					<ImageIcon
						src='/assets/bounty-icons/bounty-image.svg'
						alt='bounty icon'
						imgClassName='mt-5 mb-3'
						imgWrapperClassName=''
					/>
					<div className={`${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
						<span className='mr-1 text-base font-medium text-blue-light-medium dark:text-blue-dark-medium'>#{post_id}</span>
						<span className='text-lg font-bold text-blue-light-high dark:text-blue-dark-high'>{title}</span>
					</div>
					<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-sm font-normal`}>{getAscciiFromHex(description).slice(0, 140)}</p>
					{tags && tags.length > 0 && (
						<div className='flex gap-x-1'>
							{tags.map((tag: string, index: number) => (
								<div
									key={index}
									className='w-min rounded-xl border-[1px] border-solid border-section-light-container px-[14px] py-1 text-[10px] font-medium text-lightBlue dark:border-[#3B444F] dark:text-blue-dark-medium'
								>
									{tag}
								</div>
							))}
						</div>
					)}
					<div className='flex items-center justify-between'>
						<div>
							<span className={`${poppins.variable} ${poppins.className} mr-1 text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium`}>Proposer:</span>
							<ImageComponent
								alt='user img'
								src={userImageData[0]?.image}
								className='-mt-[1px] mr-[1px] h-[16px] w-[16px]'
							/>
							<span className={`${poppins.variable} ${poppins.className} text-xs font-medium text-blue-light-high dark:text-blue-dark-high`}>{userImageData[0]?.username}</span>
						</div>
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
							<div className='flex items-center rounded-md p-1 hover:bg-[#f5f5f5]  dark:hover:bg-section-dark-garyBackground'>
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
						src={'assets/bounty-icons/child-bounty-icon.svg'}
						width={16}
						height={16}
						alt='curator'
					/>
					<span className='text-[13px] font-medium text-white'>Child Bounties:</span>
					<span className='text-[13px] font-medium text-white'>{childBountiesCount}</span>
				</div>
			</Link>
			<div className='cursor-pointer '>
				<Image
					src={'assets/bounty-icons/arrow-icon.svg'}
					width={16}
					height={16}
					alt='arrow'
				/>
			</div>
		</section>
	);
};

export default HotBountyCard;
