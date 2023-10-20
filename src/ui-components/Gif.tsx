// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @next/next/no-img-element */
import React, { FC, useEffect, useRef, useState } from 'react';
import { GifsResult, GiphyFetch } from '@giphy/js-fetch-api';
import { Pagination, PaginationProps, Spin, Input, Tabs } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import classNames from 'classnames';

const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || '');
const { Search } = Input;

export interface IGifProps {
	onClick: (url: string, title: string) => void;
	className?: string;
}

const GIF_LISTING_LIMIT = 9;

const Gif: FC<IGifProps> = (props) => {
	const [gifResult, setGifResult] = useState<GifsResult | null>(null);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [loading, setLoading] = useState(false);
	const [tab, setTab] = useState('trending');
	const [query, setQuery] = useState<string>('');
	const timeout = useRef<NodeJS.Timeout>();

	useEffect(() => {
		if (tab === 'trending' || query.length === 0) {
			setLoading(true);
			gf.trending({
				limit: GIF_LISTING_LIMIT,
				offset: GIF_LISTING_LIMIT * currentPage
			})
				.then((res: any) => {
					setGifResult(res);
					setLoading(false);
				})
				.finally(() => {
					setLoading(false);
				});
		} else if (tab === 'search') {
			setLoading(true);
			gf.search(query, {
				limit: GIF_LISTING_LIMIT,
				offset: GIF_LISTING_LIMIT * currentPage
			})
				.then((res: any) => {
					setGifResult(res);
					setLoading(false);
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [currentPage, tab, query]);

	const onChange: PaginationProps['onChange'] = (page) => {
		setCurrentPage(page);
	};

	return (
		<Spin
			className='min-h-[480px]'
			spinning={loading}
			indicator={<LoadingOutlined />}
		>
			<section className={classNames('flex min-h-[480px] flex-col gap-y-5', props.className)}>
				{gifResult ? (
					<>
						<article>
							<Tabs
								onTabClick={(key) => {
									setTab((prev) => {
										if (prev !== key) {
											setCurrentPage(1);
										}
										return key;
									});
								}}
								type='card'
								className='ant-tabs-tab-bg-white font-medium text-bodyBlue dark:text-white'
								items={[
									{
										key: 'trending',
										label: 'Trending'
									},
									{
										key: 'search',
										label: 'Search'
									}
								]}
							/>
						</article>
						{tab === 'search' ? (
							<article>
								<Search
									onChange={(e) => {
										if (timeout.current) {
											clearTimeout(timeout.current);
										}
										timeout.current = setTimeout(() => {
											setCurrentPage(1);
											setQuery((e.target.value || '').trim());
										}, 1000);
									}}
									placeholder='Search gif'
								/>
							</article>
						) : null}
						<article className='grid grid-cols-3 gap-5'>
							{gifResult.data &&
								gifResult.data.map((gif: any) => {
									return (
										<button
											onClick={() => {
												if (props.onClick) {
													props.onClick(gif.images.original.url, gif.title);
												}
											}}
											key={gif.id}
											className='flex h-28 cursor-pointer items-center justify-center border-none bg-transparent outline-none'
										>
											<img
												className='h-full w-full object-cover'
												src={gif.images.original.url}
												alt={gif.title}
											/>
										</button>
									);
								})}
						</article>
						<article className='flex items-center justify-end'>
							<Pagination
								size='small'
								defaultCurrent={1}
								current={currentPage}
								onChange={onChange}
								total={gifResult.pagination.total_count || 0}
								showSizeChanger={false}
								pageSize={GIF_LISTING_LIMIT}
								responsive={true}
								hideOnSinglePage={true}
							/>
						</article>
					</>
				) : null}
			</section>
		</Spin>
	);
};

export default styled(Gif)`
	.ant-tabs-nav {
		margin: 0 !important;
	}
`;
