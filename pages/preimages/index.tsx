// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Pagination as AntdPagination , Skeleton } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { getPreimages } from 'pages/api/v1/listing/preimages';
import React, { FC, useEffect } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useNetworkContext } from '~src/context';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import SEOHead from '~src/global/SEOHead';
import { IPreimagesListingResponse } from '~src/types';
import { ErrorState } from '~src/ui-components/UIStates';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import { useTheme } from 'next-themes';
import styled from 'styled-components';

const PreImagesTable = dynamic(() => import('~src/components/PreImagesTable'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { page = 1 } = query;
	const network = getNetworkFromReqHeaders(req.headers);

	const { data, error } = await getPreimages({
		listingLimit: LISTING_LIMIT,
		network,
		page
	});
	return { props: { data, error, network } };
};

interface IPreImagesProps {
	data?: IPreimagesListingResponse;
	error?: string;
	network: string
}

const Pagination = styled(AntdPagination)`
	a{
		color: ${props => props.theme === 'dark' ? '#fff' : '#212121'} !important;
	}
	.ant-pagination-item-active {
		background-color: ${props => props.theme === 'dark' ? 'black' : 'white'} !important;
	}
	.anticon-right {
		color: ${props => props.theme === 'dark' ? 'white' : ''} !important;
	}
	.anticon-left {
		color: ${props => props.theme === 'dark' ? 'white' : ''} !important;
	}
`;

const PreImages: FC<IPreImagesProps> = (props) => {
	const { data, error, network } = props;
	const { setNetwork } = useNetworkContext();
	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		setNetwork(props.network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const router = useRouter();

	if (error) return <ErrorState errorMessage={error} />;
	if (!data) return null;
	const { preimages, count } = data;

	const onPaginationChange = (page: number) => {
		router.push({
			query: {
				page
			}
		});
		handlePaginationChange({ limit: LISTING_LIMIT, page });
	};

	return (
		<>
			<SEOHead title='PreImages' network={network}/>
			<h1 className='text-blue-light-high dark:text-blue-dark-high font-semibold text-2xl leading-9 mx-2'>{ count } Preimages</h1>

			{/* <div className="mt-8 mx-1">
				<PreImagesTable tableData={tableData} />
			</div> */}

			<div className='shadow-md bg-white dark:bg-section-dark-overlay p-3 md:p-8 rounded-xxl'>
				<div>
					<PreImagesTable theme={theme} preimages={preimages} />

					<div className='flex justify-end mt-6'>
						{
							!!preimages && preimages.length > 0 && count && count > 0 && count > LISTING_LIMIT &&
							<Pagination
								theme={theme}
								defaultCurrent={1}
								pageSize={LISTING_LIMIT}
								total={count}
								showSizeChanger={false}
								hideOnSinglePage={true}
								onChange={onPaginationChange}
								responsive={true}
							/>
						}
					</div>
				</div>
			</div>
		</>
	);
};

export default PreImages;