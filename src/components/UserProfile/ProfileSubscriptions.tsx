// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { SubscriptionsIcon } from '~src/ui-components/CustomIcons';
import Image from 'next/image';
import Link from 'next/link';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { Divider, Spin } from 'antd';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import { removeSymbols } from '~src/util/htmlDiff';
import { getSinglePostLinkFromProposalType } from '~src/global/proposalType';
import { poppins } from 'pages/_app';
import { Pagination } from '~src/ui-components/Pagination';
import { useTheme } from 'next-themes';
import ImageIcon from '~src/ui-components/ImageIcon';
import ImageComponent from '../ImageComponent';

interface Props {
	className?: string;
}
const removeSpaces = (text: string) => {
	return text.replace(/&nbsp;|&lt;|&gt;|&amp;|&quot;|&#39;/g, '');
};

const ProfileSubscriptions = ({ className }: Props) => {
	const { network } = useNetworkSelector();
	const { id } = useUserDetailsSelector();
	const [page, setPage] = useState<number>(1);
	const [data, setData] = useState<any>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [totalCount, setTotalCount] = useState<number>(0);
	const { resolvedTheme: theme } = useTheme();

	const getData = async () => {
		setLoading(true);
		try {
			const { data, error } = await nextApiClientFetch<any>('/api/v1/users/subscriptions', {
				page,
				userId: id
			});
			if (data && data?.data) {
				setData(data?.data);
				setTotalCount(data?.totalCount);
			} else if (error) {
				console.error('Error:', error);
			}
		} catch (error) {
			console.error('Request error:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, page]);

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	return (
		<Spin spinning={loading}>
			<div
				className={classNames(
					className,
					'mt-6 flex min-h-[280px] flex-col rounded-[14px] border-[1px] border-solid border-[#D2D8E0] bg-white py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
				)}
			>
				<div className={`mb-4 ${poppins.className} ${poppins.variable} flex items-center space-x-1 px-6`}>
					<SubscriptionsIcon className='active-icon text-[24px] text-lightBlue dark:text-[#9E9E9E]' />
					<span className='ml-2 text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Subscriptions</span>
					<span className='ml-2 mt-1 text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium'>({totalCount})</span>
				</div>
				{totalCount == 0 ? (
					<div className='mx-auto my-10'>
						<ImageIcon
							alt='Empty icon'
							src={theme === 'dark' ? '/assets/EmptyStateDark.svg' : '/assets/EmptyStateLight.svg'}
							imgClassName='w-[225px] h-[225px]'
						/>
					</div>
				) : (
					<>
						{data.map((item: any, index: number) => {
							const date = new Date(item?.createdAt);
							return (
								<div
									key={index}
									className='mt-4 px-2'
								>
									<div className='mb-3 px-6'>
										<div className='flex items-center justify-between'>
											<div className={`flex ${poppins.className} ${poppins.variable} items-center space-x-2`}>
												<ImageComponent
													src={item.image}
													alt='user icon'
												/>
												<span className='text-sm font-semibold text-blue-light-high dark:text-blue-dark-high'>{item.reacted_by}</span>
												<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>subscribed to</span>
											</div>
											{item.createdAt && (
												<div className='hidden items-center text-xs text-lightBlue dark:text-icon-dark-inactive sm:flex'>
													<ClockCircleOutlined className='mr-1' /> {getRelativeCreatedAt(date)}
												</div>
											)}
										</div>
										<div>
											<span className='ml-10 text-sm font-medium text-blue-light-high dark:text-blue-dark-high'>
												#{item?.postId} {item?.postTitle.length > 95 ? `${item?.postTitle?.slice(0, 95)}...` : item?.postTitle}
											</span>
											<Link
												href={`https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(item.postType)}/${item.postId}`}
												target='_blank'
											>
												<Image
													src='/assets/icons/redirect.svg'
													alt='redirection-icon'
													width={16}
													height={16}
													className='ml-1'
												/>
											</Link>
										</div>
										{item?.postContent?.length > 0 && (
											<div className='ml-10 mt-2 items-center rounded-sm border-0 border-l-[1.5px] border-solid border-pink_primary bg-[#FAFAFC] px-4 pb-2.5 pt-2 text-bodyBlue dark:bg-[#191919] dark:text-blue-dark-high'>
												{removeSpaces(removeSymbols(item.postContent)).slice(0, 400)}...
											</div>
										)}
									</div>
									{index !== data.length - 1 && <Divider className='m-0 bg-[#D2D8E0] p-0 dark:bg-separatorDark' />}
								</div>
							);
						})}
						{totalCount < 10 ? null : (
							<Pagination
								theme={theme}
								className='mr-6 mt-4 flex justify-end'
								current={page}
								total={totalCount}
								onChange={handlePageChange}
							/>
						)}
					</>
				)}
			</div>
		</Spin>
	);
};

export default ProfileSubscriptions;
