// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { spaceGrotesk } from 'pages/_app';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { LeftOutlined } from '@ant-design/icons';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useRouter } from 'next/router';
import { BOUNTIES_LISTING_LIMIT } from '~src/global/listingLimit';
import { Pagination } from '~src/ui-components/Pagination';
import CreateBountyBtn from '~src/components/UserCreatedBounties/CreateBountyBtn';
import BountiesTabItems from '~src/components/UserCreatedBounties/BountiesListing/BountiesTabItems';
import { getUserCreatedBounties } from 'pages/api/v1/user-created-bounties/getAllBounties';

interface IUserBountiesListingProps {
	network: string;
	data?: any;
}
export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const network = getNetworkFromReqHeaders(req?.headers);
	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const page = query?.page || 1;
	const filterBy = query?.filterBy ? JSON.parse(decodeURIComponent(String(query?.filterBy))) : [];
	const status = query?.status ? JSON.parse(decodeURIComponent(String(query?.status))) : '';

	const { data } = await getUserCreatedBounties({
		filterBy: filterBy,
		network,
		page: Number(page),
		status
	});

	return {
		props: {
			data,
			network
		}
	};
};

const UserBountiesListing: FC<IUserBountiesListingProps> = (props) => {
	const { network, data } = props;
	const dispatch = useDispatch();
	const router = useRouter();
	const [bounties, setBounties] = useState<any>();
	const { resolvedTheme: theme } = useTheme();
	const onPaginationChange = (page: number) => {
		router?.push({
			pathname: router?.pathname,
			query: {
				...router?.query,
				page
			}
		});
	};
	useEffect(() => {
		setBounties(data);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	useEffect(() => {
		dispatch(setNetwork(props?.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props?.network]);

	return (
		<div>
			<SEOHead
				title='User-created bounties'
				desc='Discover and participate in treasury-funded bounties on Polkassembly, where members can propose and work on projects to improve the governance and growth of our community.'
				network={network}
			/>
			<div>
				<Link
					className='inline-flex items-center text-sidebarBlue hover:text-pink_primary dark:text-white'
					href='/bounty-dashboard'
					aria-label='Back to Bounty Dashboard'
				>
					<div className='flex items-center'>
						<LeftOutlined
							className='mr-2 text-xs'
							aria-hidden='true'
						/>
						<span className='text-sm font-medium'>Back to Bounty Dashboard</span>
					</div>
				</Link>

				<div className='flex items-center justify-between pt-4'>
					<span className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-[32px] font-bold text-blue-light-high dark:text-blue-dark-high dark:text-lightWhite`}>
						User Created Bounties
					</span>
					<div className='flex gap-2'>
						<CreateBountyBtn className='hidden md:block' />
					</div>
				</div>
				<BountiesTabItems bounties={bounties} />

				<div className='mb-5 mt-3 flex justify-end'>
					{bounties?.length > BOUNTIES_LISTING_LIMIT && (
						<Pagination
							pageSize={BOUNTIES_LISTING_LIMIT}
							current={Number(router?.query?.page) || 1}
							total={bounties?.length}
							showSizeChanger={false}
							hideOnSinglePage={true}
							onChange={onPaginationChange}
							responsive={true}
							theme={theme}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default UserBountiesListing;