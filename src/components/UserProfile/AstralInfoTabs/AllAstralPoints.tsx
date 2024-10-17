// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, Spin } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import REPUTATION_SCORES from '~src/util/reputationScores';
import { ClockCircleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { EUserActivityCategory } from '~src/types';
import { AstralIcon } from '~src/ui-components/CustomIcons';
import Link from 'next/link';

interface Props {
	className?: string;
	userId?: number;
	type?: any;
}

const AllAstralPoints = ({ userId, type }: Props) => {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [page, setPage] = useState<number>(1);
	const [hasMoreData, setHasMoreData] = useState<boolean>(true);
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 768;

	const getAllAstralPointsData = async (pageNumber: number) => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<any>(`api/v1/leaderboard/user-points?user_id=${userId}&page=${pageNumber}&activity_category=${type}`);
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
		if (userId) {
			getAllAstralPointsData(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

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
		<Spin
			spinning={loading}
			className='mt-3'
		>
			{!loading && (
				<section className='mt-4'>
					{data?.length ? (
						isMobile ? (
							Object.keys(groupedData).map((date, index) => (
								<div key={index}>
									<p className='mb-3 flex items-center gap-x-1 text-xs text-lightBlue dark:text-blue-dark-medium'>
										<ClockCircleOutlined /> {date}
									</p>
									{groupedData[date].map((item: any, idx: number) => (
										<div
											key={idx}
											className='activity-item'
										>
											<p className='m-0 flex flex-wrap items-center gap-x-1 p-0 text-bodyBlue dark:text-blue-dark-medium'>
												<div className='mr-2 hidden h-6 w-6 items-center justify-center rounded-full bg-[#FFBA03] md:flex'>
													<AstralIcon className='m-0 ml-1 mt-1 scale-[70%] text-[28px] text-lightBlue' />
												</div>
												<span className='whitespace-nowrap font-normal'>
													Earned <span className='text-base font-bold text-[#FFBA03]'>+{String(getPoints(item.type))}</span> for
												</span>
												<span className='whitespace-nowrap text-sm font-normal'>
													{item?.type?.toLowerCase()} on <span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-medium'>#{item.post_id}</span>
												</span>
												<Image
													src={getType(item.type) === EUserActivityCategory.ON_CHAIN ? '/assets/icons/on-chain-light.svg' : '/assets/icons/off-chain-light.svg'}
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
											{idx < groupedData[date].length - 1 && (
												<Divider
													style={{ background: '#D2D8E0', flexGrow: 1 }}
													className='my-4 dark:bg-separatorDark'
												/>
											)}
										</div>
									))}
									{index < Object.keys(groupedData).length - 1 && (
										<Divider
											style={{ background: '#D2D8E0', flexGrow: 1 }}
											className='my-4 dark:bg-separatorDark'
										/>
									)}
								</div>
							))
						) : (
							data.map((item, index) => (
								<div
									key={index}
									className='activity-item'
								>
									<div className='flex flex-col justify-between md:flex-row'>
										<p className='mb-3 flex items-center gap-x-1 text-xs text-lightBlue dark:text-blue-dark-medium md:hidden'>
											<ClockCircleOutlined /> {dayjs(item.updated_at).format('DD MMM YYYY')}
										</p>

										<p className='m-0 flex flex-wrap items-center gap-x-1 text-bodyBlue dark:text-blue-dark-medium'>
											<div className='mr-2 hidden h-6 w-6 items-center justify-center rounded-full bg-[#FFBA03] md:flex'>
												<AstralIcon className='m-0 ml-1 mt-1 scale-[70%] text-[28px] text-lightBlue' />
											</div>
											<span className='whitespace-nowrap font-normal'>
												Earned <span className='text-base font-bold text-[#FFBA03]'>+{String(getPoints(item.type))}</span> for
											</span>
											<span className='whitespace-nowrap text-sm font-normal'>
												{item?.type?.toLowerCase()} on <span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-medium'>#{item.post_id}</span>
											</span>
											<Image
												src={getType(item.type) === EUserActivityCategory.ON_CHAIN ? '/assets/icons/on-chain-light.svg' : '/assets/icons/off-chain-light.svg'}
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

										<p className='m-0 hidden items-center gap-x-1 text-xs font-normal text-lightBlue dark:text-blue-dark-medium md:flex'>
											<ClockCircleOutlined /> {dayjs(item.updated_at).format('DD MMM YYYY')}
										</p>
									</div>
									{index < data.length - 1 && (
										<Divider
											style={{ background: '#D2D8E0', flexGrow: 1 }}
											className='my-4 dark:bg-separatorDark'
										/>
									)}
								</div>
							))
						)
					) : (
						<div className='flex flex-col items-center justify-center gap-2'>
							<ImageIcon
								src={'/assets/Gifs/empty-state.gif'}
								alt='Empty Icon'
								imgClassName='-mt-[100px] w-[555px] h-[462px]'
							/>
							<h3 className='m-0 -mt-[120px] p-0 text-xl font-semibold text-bodyBlue dark:text-blue-dark-high'>Nothing to see here</h3>
							<p className='m-0 flex items-center gap-x-1 text-sm text-bodyBlue dark:text-blue-dark-medium'>
								Click{' '}
								<Link
									href='/astral-scoring'
									target='_blank'
									className='m-0 mt-1 cursor-pointer text-sm text-pink_primary'
								>
									here
								</Link>{' '}
								to view how you can earn more On-chain activity points
							</p>
						</div>
					)}
					{/* Load More Button */}
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
	);
};

export default AllAstralPoints;
