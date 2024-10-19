// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, Spin } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { ProfileDetailsResponse } from '~src/auth/types';
import { EUserActivityCategory } from '~src/types';
import ImageIcon from '~src/ui-components/ImageIcon';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import REPUTATION_SCORES from '~src/util/reputationScores';
import { ClockCircleOutlined } from '@ant-design/icons';
import AstralScoreCardHeader from './AstralScoreCardHeader';

interface Props {
	className?: string;
	theme?: string;
	userProfile: ProfileDetailsResponse;
}

const AstralsScoreCard = ({ userProfile, className, theme }: Props) => {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [page, setPage] = useState<number>(1);
	const [hasMoreData, setHasMoreData] = useState<boolean>(true);

	const getAllAstralPointsData = async (pageNumber: number) => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<any>(`api/v1/leaderboard/user-points?user_id=${userProfile?.user_id}&page=${pageNumber}`);
		setLoading(false);
		if (error) {
			console.log(error);
			return;
		}
		if (data) {
			if (data.data?.length) {
				setData((prevData) => [...prevData, ...data.data].sort((a, b) => dayjs(b.updated_at).diff(dayjs(a.updated_at))));
			} else {
				setHasMoreData(false);
			}
		}
	};

	useEffect(() => {
		if (userProfile?.user_id) {
			getAllAstralPointsData(1);
		}
	}, [userProfile?.user_id]);

	const handleLoadMore = () => {
		const nextPage = page + 1;
		setPage(nextPage);
		getAllAstralPointsData(nextPage);
	};

	const getPoints = (type: string) => {
		const scoreDetails = Object.values(REPUTATION_SCORES).find((score) => score.type === type);
		return scoreDetails && 'value' in scoreDetails ? scoreDetails.value : 0;
	};

	const getType = (type: string) => {
		const activityDetails = Object.values(REPUTATION_SCORES).find((score) => score.type === type);
		return activityDetails && 'category' in activityDetails ? activityDetails.category : 0;
	};

	const groupedData = data.reduce((acc: any, item: any) => {
		const date = dayjs(item.updated_at).format('DD MMM YYYY');
		if (!acc[date]) {
			acc[date] = [];
		}
		acc[date].push(item);
		return acc;
	}, {});

	return (
		<div
			className={classNames(
				theme,
				className,
				'flex flex-col gap-5 rounded-[14px] border-[1px] border-solid border-section-light-container bg-white px-4 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
			)}
		>
			<span className='flex items-center gap-1.5 text-xl font-semibold dark:text-blue-dark-high'>
				<ImageIcon
					src='/assets/icons/astral-star-icon.svg'
					alt='astral-star-icon'
					imgWrapperClassName='scale-110 -mt-0.5'
				/>
				Astrals
			</span>
			<AstralScoreCardHeader userProfile={userProfile} />
			<Spin
				spinning={loading}
				className='mt-3'
			>
				{!loading && (
					<section className='mt-2'>
						{data?.length ? (
							Object.keys(groupedData).map((date, index) => (
								<div key={index}>
									<p className='mb-3 flex items-center gap-x-1 text-xs text-lightBlue dark:text-blue-dark-medium'>
										<ClockCircleOutlined /> {date}
									</p>
									{groupedData[date].map((item: any, idx: number) => {
										const keyOfReputationScore = (Object.keys(REPUTATION_SCORES) as Array<keyof typeof REPUTATION_SCORES>)
                                            .map((key) => ({ key, type: REPUTATION_SCORES[key].type }))
                                            .find((entry) => entry.type === item.type)?.key;

										return (
											<div
												key={idx}
												className='activity-item'
											>
												<div className='flex items-center justify-between'>
													<p className='m-0 flex flex-wrap items-center gap-x-1 p-0 text-bodyBlue dark:text-blue-dark-medium'>
														<span className='m-0 p-0 flex items-center text-base font-bold text-[#FFBA03]'>
															+{String(getPoints(item.type))}{' '}
															<ImageIcon
																src='/assets/icons/astral-star-icon.svg'
																alt='astral-star-icon'
																imgWrapperClassName='scale-[70%] -mt-0.5'
															/>
														</span>{' '}
														for{' '}
														<span className='whitespace-nowrap text-sm font-normal'>
															{keyOfReputationScore} on{' '}
															<span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-medium'>
																#{item.post_id}
															</span>
														</span>
														<Image
															src={
																getType(item.type) === EUserActivityCategory.ON_CHAIN
																	? '/assets/icons/on-chain-light.svg'
																	: '/assets/icons/off-chain-light.svg'
															}
															alt=''
															className='scale-90'
															width={20}
															height={20}
														/>
														<Link
															href={`/referenda/${item.post_id}`}
															target='_blank'
														>
															<Image
																src={'/assets/icons/redirect-pink-icon.svg'}
																alt=''
																className='scale-90'
																width={20}
																height={20}
															/>
														</Link>
													</p>
												</div>
												{idx < groupedData[date].length - 1 && (
													<Divider
														style={{ background: '#D2D8E0', flexGrow: 1 }}
														className='my-4 dark:bg-separatorDark'
													/>
												)}
											</div>
										);
									})}
									{index < Object.keys(groupedData).length - 1 && (
										<Divider
											style={{ background: '#D2D8E0', flexGrow: 1 }}
											className='my-4 dark:bg-separatorDark'
										/>
									)}
								</div>
							))
						) : (
							<div className='flex flex-col items-center justify-center gap-2'>
								<ImageIcon
									src={'/assets/Gifs/empty-state.gif'}
									alt='Empty Icon'
									imgClassName='w-[555px] h-[462px]'
								/>
								<h3 className='m-0 -mt-[120px] p-0 text-xl font-semibold text-bodyBlue dark:text-blue-dark-high'>Nothing to see here</h3>
								<p className='m-0 p-0 text-center text-sm text-bodyBlue dark:text-blue-dark-medium'>
									Click{' '}
									<Link
										href='/astral-scoring'
										target='_blank'
										className='m-0 cursor-pointer p-0 text-sm text-pink_primary'
									>
										here
									</Link>{' '}
									to view how you can earn more On-chain activity points
								</p>
							</div>
						)}
						{hasMoreData && data.length > 0 && (
							<div className='mt-9 flex w-full justify-center'>
								<Button
									onClick={handleLoadMore}
									className='flex h-[40px] items-center gap-x-1 rounded-[20px] border-none bg-lightWhite text-lightBlue dark:bg-inactiveIconDark dark:text-blue-dark-medium'
								>
									Load More
									<Image
										src='/assets/icons/ArrowCircleUpRight.svg'
										alt='down-arrow'
										className='dark-icons'
										width={20}
										height={20}
									/>
								</Button>
							</div>
						)}
					</section>
				)}
			</Spin>
		</div>
	);
};

export default AstralsScoreCard;
