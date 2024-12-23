// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @next/next/no-img-element */
import React, { FC, useEffect, useRef, useState } from 'react';
import { GifsResult, GiphyFetch } from '@giphy/js-fetch-api';
import { PaginationProps, Spin, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import classNames from 'classnames';
import { Tabs } from './Tabs';
import { Pagination } from '~src/ui-components/Pagination';
import { useTheme } from 'next-themes';

const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || '');
const { Search } = Input;

export interface IGifProps {
	onClick: (url: string, title: string) => void;
	className?: string;
	theme?: string;
}

const GIF_LISTING_LIMIT = 9;

const Gif: FC<IGifProps> = (props) => {
	const [gifResult, setGifResult] = useState<GifsResult | null>(null);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [loading, setLoading] = useState(false);
	const [tab, setTab] = useState('trending');
	const [query, setQuery] = useState<string>('');
	const timeout = useRef<NodeJS.Timeout>();
	const { resolvedTheme: theme } = useTheme();

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
								theme={theme}
								onTabClick={(key: any) => {
									setTab((prev) => {
										if (prev !== key) {
											setCurrentPage(1);
										}
										return key;
									});
								}}
								type='card'
								className='ant-tabs-tab-bg-white font-medium text-bodyBlue dark:text-blue-dark-high'
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
								theme={theme}
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
	.ant-input {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : '#fff')} !important;
		color: ${(props: any) => (props.theme === 'light' ? '#0D0D0D' : '#fff')} !important;
		border-color: ${(props: any) => (props.theme === 'dark' ? '#3B444F' : '')} !important;
	}
	.ant-input-search-button {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : '#fff')} !important;
		color: ${(props: any) => (props.theme === 'light' ? '' : '#fff')} !important;
		border-color: ${(props: any) => (props.theme === 'dark' ? '#3B444F' : '')} !important;
	}
`;
