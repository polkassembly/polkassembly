// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getOffChainPosts } from 'pages/api/v1/listing/off-chain-posts';
import { IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import React, { FC, useEffect, useState } from 'react';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { OffChainProposalType, ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import { ErrorState } from '~src/ui-components/UIStates';
import { DiscussionsIcon } from '~src/ui-components/CustomIcons';
import { redisGet, redisSet } from '~src/auth/redis';
import { generateKey } from '~src/util/getRedisKeys';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import OffChainTabs from '~src/components/Listing/OffChain/OffChainTabs';
import OffChainPostsContainer from '~src/components/Listing/OffChain/OffChainPostsContainer';
import { isForumSupportedNetwork } from '~src/global/ForumNetworks';

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
	const { resolvedTheme: theme } = useTheme();
	const { id } = useUserDetailsSelector();
	const router = useRouter();
	console.log({ userId: id });

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
				desc="Welcome to Polkassembly's discussion page! Engage in meaningful and respectful dialogue on a variety of topics relevant to our community. We look forward to hearing your thoughts and ideas about governance!"
				network={network}
			/>

			<div className='mt-3 flex w-full flex-col justify-between align-middle sm:flex-row'>
				<div className='mx-2 flex text-2xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high'>
					<DiscussionsIcon className='text-lg text-lightBlue dark:text-icon-dark-inactive xs:mr-3 sm:mr-2 sm:mt-[2px]' />
					Discussions({count})
				</div>
				<button
					onClick={handleClick}
					className='flex cursor-pointer items-center justify-center whitespace-pre rounded-[4px] border-none  bg-pink_primary p-3 font-medium leading-[20px] tracking-[0.01em] text-white shadow-[0px_6px_18px_rgba(0,0,0,0.06)] outline-none xs:mt-3 sm:-mt-1 sm:h-[40px] sm:w-[120px]'
				>
					+ Add Post
				</button>
			</div>

			{/* Intro and Create Post Button */}
			<div className='mt-3 w-full rounded-xxl bg-white px-4 py-2 shadow-md dark:bg-section-dark-overlay md:px-8 md:py-4'>
				<p className='m-0 mt-2 p-0 text-sm font-normal tracking-normal text-bodyBlue dark:text-blue-dark-high'>
					Discussions is a space for the community to engage in meaningful conversations around on-chain proposals. It’s a space to share insights, provide feedback, and
					collaborate on ideas that impact the network. On-chain posts are automatically generated as soon as a proposal is created, and only the proposer can edit the original
					details. Join the conversation and help shape the future of the ecosystem.
				</p>
			</div>
			{isForumSupportedNetwork(network) ? (
				<OffChainTabs
					posts={posts}
					defaultPage={page || 1}
					count={count}
					className='mt-6'
				/>
			) : (
				<OffChainPostsContainer
					proposalType={OffChainProposalType.DISCUSSIONS}
					posts={posts}
					defaultPage={page || 1}
					count={count}
					className='mt-6'
				/>
			)}
			<ReferendaLoginPrompts
				modalOpen={openModal}
				setModalOpen={setModalOpen}
				image='/assets/Gifs/login-discussion.gif'
				title='Join Polkassembly to Start a New Discussion.'
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
				theme={theme}
			/>
		</>
	);
};

export default Discussions;
