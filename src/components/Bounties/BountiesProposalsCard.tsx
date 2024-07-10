// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Divider } from 'antd';
import Image from 'next/image';
import { poppins, spaceGrotesk } from 'pages/_app';
import ImageIcon from '~src/ui-components/ImageIcon';
import TrackTag from '~src/ui-components/TrackTag';
// import getAscciiFromHex from '~src/util/getAscciiFromHex';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import { getTrackNameFromId } from '~src/util/trackNameFromId';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import styled from 'styled-components';
import getAscciiFromHex from '~src/util/getAscciiFromHex';
import ImageComponent from '../ImageComponent';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { UserProfileImage } from 'pages/api/v1/auth/data/getUsersProfileImages';
import Skeleton from '~src/basic-components/Skeleton';

export interface BountiesProposalsCardProps {
	activeData: any;
}

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

const HeaderBtns = styled.div`
	&:after {
		content: '';
		position: absolute;
		bottom: 29px;
		right: 105px;
		height: 12px;
		width: 12px;
		border-radius: 100%;
		box-shadow: 0px 4px 0 0px ${(props: any) => (props.theme === 'dark' ? 'white' : 'black')} !important;
	}
	&:before {
		content: '';
		position: absolute;
		bottom: 4px;
		right: 105px;
		height: 12px;
		width: 12px;
		border-radius: 100%;
		box-shadow: 0px -4px 0 0px ${(props: any) => (props.theme === 'dark' ? 'white' : 'black')} !important;
	}
`;

const BountiesProposalsCard: React.FC<BountiesProposalsCardProps> = ({ activeData }) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const { track_no, tags, title, description, reward, user_id, post_id } = activeData;
	const [userImageData, setUserImageData] = useState<UserProfileImage[]>([]);
	const [loading, setLoading] = useState(false);

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
		const fetchData = async () => {
			setLoading(true);
			await getUserProfile([user_id]);
			setLoading(false);
		};
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [post_id, user_id, network]);

	function formatTrackName(str: string) {
		return str
			.split('_')
			.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	return (
		<section className='w-full md:w-[383px]'>
			{loading ? (
				<Skeleton />
			) : (
				<div className='w-full md:w-[383px]'>
					<div className='flex'>
						<CardHeader
							theme={theme as any}
							className='relative flex h-[56px] w-full items-center justify-start gap-4 rounded-t-3xl border-b-0 border-l border-r border-t border-solid border-section-light-container bg-white px-3 pt-5 dark:border-section-dark-container dark:bg-section-light-overlay'
						>
							<h2 className='mt-4 font-pixeboy text-[35px] font-normal text-pink_primary'>${Number(formatedBalance(reward.toString(), unit).replaceAll(',', ''))}</h2>
							<Divider
								type='vertical'
								className='h-[30px] bg-section-light-container dark:bg-section-dark-container'
							/>
							<h2 className='mt-3 font-pixeboy text-[22px] font-normal dark:text-white'>52%</h2>
						</CardHeader>
						<Link
							href={`/referenda/${post_id}`}
							target='_blank'
						>
							<HeaderBtns
								theme={theme as any}
								className='relative ml-2 flex w-full items-center'
							>
								<Image
									src={theme === 'light' ? '/assets/bounty-icons/redirect-icon.svg' : '/assets/bounty-icons/redirect-icon-black.svg'}
									width={45}
									height={45}
									alt='redirect link'
									className='-mr-[2px] h-[36px] w-[36px] cursor-pointer rounded-full bg-black dark:bg-white md:h-auto md:w-auto'
								/>
								<div className='h-2 w-[10px] bg-black dark:bg-white'></div>
								<button
									className={`${spaceGrotesk.className} ${spaceGrotesk.variable} -ml-[2px] h-[36px] w-[75px] cursor-pointer rounded-3xl border-none bg-black text-base font-bold text-white dark:bg-white dark:text-black md:h-[44px] md:w-[100px] md:text-lg`}
								>
									Vote
								</button>
							</HeaderBtns>
						</Link>
					</div>
					<div
						className={`rounded-b-3xl rounded-tr-2xl border-b border-l border-r border-t-0 
                     border-solid border-section-light-container bg-white px-3 py-1 dark:border-section-dark-container dark:bg-section-light-overlay`}
					>
						<ImageIcon
							src='/assets/bounty-icons/bounty-image.svg'
							alt='bounty icon'
							imgClassName='mt-5 mb-3 w-full md:w-auto'
							imgWrapperClassName=''
						/>
						<div className={`${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
							<span className='mr-1 text-base font-medium text-blue-light-medium dark:text-blue-dark-medium'>#{post_id}</span>
							<span className='text-lg font-bold text-blue-light-high dark:text-blue-dark-high'>{title}</span>
						</div>
						<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium`}>
							{getAscciiFromHex(description).slice(0, 140)}
						</p>
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
						<div>
							<span className={`${poppins.variable} ${poppins.className} mr-1 text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium`}>Proposer:</span>
							<ImageComponent
								alt='user img'
								src={userImageData[0]?.image}
								className='-mt-[1px] mr-[1px] h-[16px] w-[16px]'
							/>
							<span className={`${poppins.variable} ${poppins.className} text-xs font-medium text-blue-light-high dark:text-blue-dark-high`}>{userImageData[0]?.username}</span>
						</div>
						<div className='mb-3 mt-2'>
							<TrackTag
								theme={theme as any}
								className='sm:mt-0'
								track={formatTrackName(getTrackNameFromId(network, track_no))}
							/>
						</div>
					</div>
				</div>
			)}
		</section>
	);
};

export default BountiesProposalsCard;
