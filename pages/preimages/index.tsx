// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Pagination as AntdPagination } from '~src/ui-components/Pagination';
import { Input } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { getPreimages } from 'pages/api/v1/listing/preimages';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import { IPreimagesListingResponse } from '~src/types';
import { ErrorState } from '~src/ui-components/UIStates';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import styled, { DefaultTheme } from 'styled-components';
import { useTheme } from 'next-themes';
import Skeleton from '~src/basic-components/Skeleton';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

const PreImagesTable = dynamic(() => import('~src/components/PreImagesTable'), {
	loading: () => <Skeleton active />,
	ssr: false
});

export const getServerSideProps: GetServerSideProps = async ({ req, query, locale }) => {
	const { page = 1, hash_contains } = query;
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;
	const translations = await serverSideTranslations(locale || '', ['common']);

	const { data, error } = await getPreimages({
		hash_contains,
		listingLimit: LISTING_LIMIT,
		network,
		page,
		...translations
	});
	return { props: { data, error, network } };
};

const Pagination = styled(AntdPagination)`
	a {
		color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#212121')} !important;
	}
	.ant-pagination-item-active {
		background-color: ${(props: any) => (props.theme === 'dark' ? 'black' : 'white')} !important;
	}
	.anticon-right {
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '')} !important;
	}
	.anticon-left {
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '')} !important;
	}
	.ant-pagination-item-ellipsis {
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '')} !important;
	}
`;

const StyledInputSearch = styled(Input.Search)<{ theme: DefaultTheme }>`
	.ant-input-group-wrapper .ant-input-group .ant-input {
		height: 32px !important;
		width: 245px !important;
	}
	.ant-input {
		border-color: ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#D2D8E0')};
		color: ${(props: any) => (props.theme === 'dark' ? '#9e9e9e' : '#243a57')} !important;
	}
	.ant-input-search-button {
		height: 32px !important;
		width: 32px !important;
		background-color: transparent !important;
		border-color: ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#D2D8E0')};
	}
	.ant-input-affix-wrapper {
		background-color: transparent !important;
		border-color: ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#D2D8E0')};
	}
	.ant-input-search-button svg {
		fill: ${(props: any) => (props.theme === 'dark' ? '#9E9E9E' : '#4B4B4B')};
	}
`;

interface IPreImagesProps {
	data?: IPreimagesListingResponse;
	error?: string;
	network: string;
}

const PreImages: FC<IPreImagesProps> = (props: any) => {
	const { data, error, network } = props;
	const dispatch = useDispatch();
	const router = useRouter();
	const { t } = useTranslation('common');
	const { resolvedTheme: theme } = useTheme();
	const [searchQuery, setSearchQuery] = useState<string | number | readonly string[] | undefined>(router.query.hash_contains || '');

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) return <ErrorState errorMessage={error} />;
	if (!data) return null;
	const { preimages, count } = data;

	const onSearch = (value: string) => {
		setSearchQuery(value);
		router
			.push({
				pathname: router.pathname,
				query: { ...router.query, hash_contains: value, page: 1 }
			})
			.then(() => {
				router.reload();
			});
	};

	const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery((e.target.value || '').trim());
	};

	const onPaginationChange = (page: number) => {
		handlePaginationChange({ limit: LISTING_LIMIT, page });
		router
			.push({
				query: {
					page
				}
			})
			.then(() => {
				router.reload();
			});
	};

	const showButton = !!router.query.hash_contains && (router.query.hash_contains as string).trim() !== '';

	const handleClick = () => {
		router
			.push({
				pathname: '/preimages',
				query: {
					hash_contains: '',
					page: 1
				}
			})
			.then(() => {
				router.reload();
			});
	};

	const currentPage = parseInt(router.query.page as string, 10) || 1;

	return (
		<>
			<SEOHead
				title='PreImages'
				desc='Discover more about preimages of on chain governance proposals on Polkassembly'
				network={network}
			/>
			<div className='mb-2 flex items-center justify-between'>
				<h1 className='mx-2 text-2xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high'>
					{count} {count > 1 ? 'Preimages' : 'Preimage'}
				</h1>
				<div className='flex items-center justify-between gap-3'>
					<StyledInputSearch
						placeholder='Search Hash'
						onSearch={onSearch}
						value={searchQuery || ''}
						onChange={onSearchInputChange}
						style={{ width: 200 }}
						theme={theme as unknown as DefaultTheme}
					/>
					{showButton && (
						<button
							onClick={handleClick}
							className='flex cursor-pointer items-center justify-center whitespace-pre rounded-[4px] border-none  bg-pink_primary px-3 py-1.5 font-medium leading-[20px] tracking-[0.01em] text-white shadow-[0px_6px_18px_rgba(0,0,0,0.06)] outline-none sm:-mt-[1px]'
						>
							{t('show_all')}
						</button>
					)}
				</div>
			</div>

			<div className='rounded-xxl bg-white p-3 shadow-md dark:bg-section-dark-overlay md:p-8'>
				<div>
					<PreImagesTable
						preimages={preimages}
						theme={theme}
					/>

					<div className='mt-6 flex justify-end'>
						{!!preimages && preimages.length > 0 && count && count > 0 && count > LISTING_LIMIT && (
							<Pagination
								theme={theme}
								current={currentPage}
								defaultCurrent={1}
								pageSize={LISTING_LIMIT}
								total={count}
								showSizeChanger={false}
								hideOnSinglePage={true}
								onChange={onPaginationChange}
								responsive={true}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default PreImages;
