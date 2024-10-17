// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, Spin } from 'antd';
import dayjs from 'dayjs';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
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
	const { resolvedTheme: theme } = useTheme();

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
				setData((prevData) => [...prevData, ...data.data]);
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

	return (
		<Spin
			spinning={loading}
			className='mt-3'
		>
			<section className='mt-4'>
				{data?.length ? (
					data.map((item, index) => {
						return (
							<div
								key={index}
								className='activity-item'
							>
								<div className='flex justify-between'>
									<p className='m-0 flex items-center gap-x-1 p-0 text-bodyBlue dark:text-blue-dark-medium'>
										<div className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFBA03]'>
											<AstralIcon className='m-0 ml-1 mt-1 scale-[70%] p-0 text-[28px] text-lightBlue' />
										</div>
										Earned <span className='text-base font-bold text-[#FFBA03]'>+{String(getPoints(item.type))}</span> for {item?.type?.toLowerCase()} on
										<span className='text-sm font-semibold'>#{item.post_id}</span>
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
									<p className='m-0 flex items-center gap-x-1 p-0 text-xs text-lightBlue dark:text-blue-dark-medium'>
										<ClockCircleOutlined /> {dayjs(item.updated_at).format('DD MMM YYYY')}
									</p>
								</div>
								<Divider
									style={{ background: '#D2D8E0', flexGrow: 1 }}
									className='my-4 dark:bg-separatorDark'
								/>
							</div>
						);
					})
				) : (
					<div className='my-9 flex flex-col items-center gap-6'>
						<ImageIcon
							src={theme == 'light' ? '/assets/EmptyStateLight.svg' : '/assets/EmptyStateDark.svg '}
							alt='Empty Icon'
							imgClassName='w-[225px] h-[225px]'
						/>
						<h3 className='text-blue-light-high dark:text-blue-dark-high'>No Data to display</h3>
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
		</Spin>
	);
};

export default styled(AllAstralPoints)``;
