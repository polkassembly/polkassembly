// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getOnChainPost, IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useEffect, useState } from 'react';
import Post from 'src/components/Post/Post';
import { PostCategory } from 'src/global/post_categories';
import BackToListingView from 'src/ui-components/BackToListingView';
import { ErrorState, LoadingState, PostEmptyState } from 'src/ui-components/UIStates';
import EmptyIcon from '~assets/icons/empty-state-image.svg';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useApiContext } from '~src/context';
import { noTitle } from '~src/global/noTitle';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { useRouter } from 'next/router';
import { checkIsOnChain } from '~src/util/checkIsOnChain';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import { getSubdomain } from '~src/util/getSubdomain';

const proposalType = ProposalType.ADVISORY_COMMITTEE;
export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { motion } = query;
	let network = getNetworkFromReqHeaders(req.headers);
	const queryNetwork = new URL(req.headers.referer || '').searchParams.get('network');
	if (queryNetwork) {
		network = queryNetwork;
	}

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { data, error, status } = await getOnChainPost({
		network,
		postId: motion,
		proposalType
	});
	return { props: { error, network, post: data, status } };
};

interface IReferendumPostProps {
	post: IPostResponse;
	error?: string;
	network: string;
	status?: number;
}

const ReferendumPost: FC<IReferendumPostProps> = (props) => {
	const { post, error, status, network } = props;
	const dispatch = useDispatch();
	const { api, apiReady } = useApiContext();
	const router = useRouter();
	const { id } = router.query;
	const [isUnfinalized, setIsUnFinalized] = useState(false);

	useEffect(() => {
		if (!api || !apiReady || !error || !status || !id || status !== 404) {
			return;
		}
		(async () => {
			setIsUnFinalized(Boolean(await checkIsOnChain(String(id), proposalType, api)));
		})();
	}, [api, apiReady, error, status, id]);

	useEffect(() => {
		dispatch(setNetwork(props.network));
		const currentUrl = window.location.href;
		const subDomain = getSubdomain(currentUrl);
		if (network && ![subDomain].includes(network)) {
			router.push({
				query: {
					network: network
				}
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (isUnfinalized) {
		return (
			<PostEmptyState
				image={<EmptyIcon />}
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
	if (error) {
		return <ErrorState errorMessage={error} />;
	}
	if (!post) return null;

	if (post) {
		return (
			<>
				<SEOHead
					title={post.title || `${noTitle} - Asvisory Committee Motion`}
					desc={post.content}
					network={network}
				/>

				<BackToListingView postCategory={PostCategory.ADVISORY_COMMITTEE} />
				<div className='mt-6'>
					<Post
						post={post}
						proposalType={proposalType}
					/>
				</div>
			</>
		);
	}
	return (
		<div className='mt-16'>
			<LoadingState />
		</div>
	);
};

export default ReferendumPost;
