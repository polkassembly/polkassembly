// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getOffChainPosts } from 'pages/api/v1/listing/off-chain-posts';
import { IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import React, { FC, useEffect, useState } from 'react';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import OffChainPostsContainer from '~src/components/Listing/OffChain/OffChainPostsContainer';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { OffChainProposalType, ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import { ErrorState } from '~src/ui-components/UIStates';
import DiscussionsIcon from '~assets/icons/discussions-icon.svg';
import { redisGet, redisSet } from '~src/auth/redis';
import { generateKey } from '~src/util/getRedisKeys';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import { useUserDetailsSelector } from '~src/redux/selectors';

interface IDiscussionsProps {
	data?: IPostsListingResponse;
	error?: string;
	network: string;
	page?: number;
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { page = 1, sortBy = sortValues.COMMENTED, filterBy } = query;

	if (!Object.values(sortValues).includes(sortBy.toString()) || (filterBy && filterBy.length !== 0 && !Array.isArray(JSON.parse(decodeURIComponent(String(filterBy)))))) {
		return {
			redirect: {
				destination: `/discussions?page=${page}&sortBy=${sortValues.COMMENTED}&filterBy=${filterBy}`,
				permanent: false
			}
		};
	}

	const redisKey = generateKey({ filterBy: filterBy, keyType: 'page', network: network, page: page, proposalType: ProposalType.DISCUSSIONS, sortBy: sortBy });

	if (process.env.IS_CACHING_ALLOWED == '1') {
		const redisData = await redisGet(redisKey);

		if (redisData) {
			const props = JSON.parse(redisData);
			if (!props.error) {
				return { props };
			}
		}
	}

	const { data, error = '' } = await getOffChainPosts({
		filterBy: filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy)))) ? JSON.parse(decodeURIComponent(String(filterBy))) : [],
		listingLimit: LISTING_LIMIT,
		network,
		page: Number(page),
		proposalType: OffChainProposalType.DISCUSSIONS,
		sortBy: String(sortBy)
	});

	const props = { data, error, network, page };

	if (process.env.IS_CACHING_ALLOWED == '1') {
		await redisSet(redisKey, JSON.stringify(props));
	}

	return { props };
};

const Discussions: FC<IDiscussionsProps> = (props) => {
	const { data, error, network, page } = props;
	const dispatch = useDispatch();
	const [openModal, setModalOpen] = useState<boolean>(false);
	const router = useRouter();

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { id } = useUserDetailsSelector();

	if (error) return <ErrorState errorMessage={error} />;
	if (!data) return null;
	const { posts, count } = data;

	const handleClick = () => {
		if (id) {
			router.push('/post/create');
		} else {
			setModalOpen(true);
		}
	};
	return (
		<>
			<SEOHead
				title='Discussions'
				network={network}
			/>

			<div className='mt-3 flex w-full flex-col justify-between align-middle sm:flex-row'>
				<div className='mx-2 flex text-2xl font-semibold leading-9 text-bodyBlue'>
					<DiscussionsIcon className='mt-2 xs:mr-3 sm:mr-2 sm:mt-1.5' />
					Latest Discussions({count})
				</div>
				<button
					onClick={handleClick}
					className='flex cursor-pointer items-center justify-center whitespace-pre rounded-[4px] border-none  bg-pink_primary p-3 font-medium leading-[20px] tracking-[0.01em] text-white shadow-[0px_6px_18px_rgba(0,0,0,0.06)] outline-none xs:mt-3 sm:-mt-1 sm:h-[40px] sm:w-[120px]'
				>
					+ Add Post
				</button>
			</div>

			{/* Intro and Create Post Button */}
			<div className='mt-3 flex flex-col md:flex-row'>
				<p className='mb-4 w-full rounded-xxl bg-white p-4 text-sm font-medium text-bodyBlue shadow-md md:p-8'>
					This is the place to discuss all things polkadot. Anyone can start a new discussion.
				</p>
			</div>
			<OffChainPostsContainer
				proposalType={OffChainProposalType.DISCUSSIONS}
				posts={posts}
				defaultPage={page || 1}
				count={count}
				className='mt-6'
			/>
			<ReferendaLoginPrompts
				modalOpen={openModal}
				setModalOpen={setModalOpen}
				image='/assets/referenda-discussion.png'
				title='Join Polkassembly to Start a New Discussion.'
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>
		</>
	);
};

export default Discussions;
