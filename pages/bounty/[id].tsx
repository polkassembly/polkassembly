// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getOnChainPost, IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useEffect } from 'react';
import Post from 'src/components/Post/Post';
import { PostCategory } from 'src/global/post_categories';
import BackToListingView from 'src/ui-components/BackToListingView';
import { ErrorState } from 'src/ui-components/UIStates';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { noTitle } from '~src/global/noTitle';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { useRouter } from 'next/router';
import { PostEmptyState } from 'src/ui-components/UIStates';
// import EmptyIcon from '~assets/icons/empty-state-image.svg';
import { checkIsOnChain } from '~src/util/checkIsOnChain';
import { useApiContext } from '~src/context';
import { useState } from 'react';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import ImageIcon from '~src/ui-components/ImageIcon';
import LoadingState from '~src/basic-components/Loading/LoadingState';
import { getSubdomain } from '~src/util/getSubdomain';

const proposalType = ProposalType.BOUNTIES;
export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { id } = query;

	let network = getNetworkFromReqHeaders(req.headers);
	const referer = req.headers.referer;

	let queryNetwork = null;
	if (referer) {
		try {
			const url = new URL(referer);
			queryNetwork = url.searchParams.get('network');
		} catch (error) {
			console.error('Invalid referer URL:', referer, error);
		}
	}
	if (queryNetwork) {
		network = queryNetwork;
	}
	if (query?.network) {
		network = query?.network as string;
	}

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { data, error, status } = await getOnChainPost({
		network,
		postId: id,
		proposalType
	});
	return { props: { error, network, post: data, status } };
};

interface IBountyPostProps {
	post: IPostResponse;
	error?: string;
	network: string;
	status?: number;
}
const BountyPost: FC<IBountyPostProps> = (props) => {
	const { post, error, network, status } = props;
	const dispatch = useDispatch();
	const router = useRouter();
	const { api, apiReady } = useApiContext();
	const [isUnfinalized, setIsUnFinalized] = useState(false);
	const { id } = router.query;

	useEffect(() => {
		dispatch(setNetwork(props.network));
		const currentUrl = window ? window.location.href : '';
		const subDomain = getSubdomain(currentUrl);
		if (network && ![subDomain]?.includes(network)) {
			router.push({
				query: {
					network: network
				}
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!api || !apiReady || !error || !status || !id || status !== 404) {
			return;
		}
		(async () => {
			setIsUnFinalized(Boolean(await checkIsOnChain(String(id), proposalType, api)));
		})();
	}, [api, apiReady, error, status, id]);

	if (isUnfinalized) {
		return (
			<PostEmptyState
				image={
					<ImageIcon
						src='/assets/icons/empty-state-image.svg'
						alt='empty state image icon'
					/>
				}
				description={
					<div className='p-5'>
						<b className='my-4 text-xl'>Waiting for Block Confirmation</b>
						<p>Usually its done within a few seconds</p>
					</div>
				}
				imageStyle={{ height: 300 }}
			/>
		);
	}

	if (error) return <ErrorState errorMessage={error} />;
	if (!post) return null;

	if (post)
		return (
			<>
				<SEOHead
					title={post.title || `${noTitle} - Bounty`}
					desc={post.content}
					network={network}
				/>

				<BackToListingView postCategory={PostCategory.BOUNTY} />

				<div className='mt-6'>
					<Post
						post={post}
						proposalType={proposalType}
					/>
				</div>
			</>
		);

	return (
		<div className='mt-16'>
			<LoadingState />
		</div>
	);
};

export default BountyPost;
