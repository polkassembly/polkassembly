// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getOnChainPost, IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, memo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Post from 'src/components/Post/Post';
import BackToListingView from 'src/ui-components/BackToListingView';
import { FrownOutlined } from '@ant-design/icons';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import LoadingState from '~src/basic-components/Loading/LoadingState';
import { noTitle } from '~src/global/noTitle';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { PostCategory } from '~src/global/post_categories';
// import ConfusedNudge from '~src/ui-components/ConfusedNudge';
import { isOpenGovSupported } from '~src/global/openGovNetworks';

const proposalType = ProposalType.OPEN_GOV;
export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { id } = query;

	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { data, error, status } = await getOnChainPost({
		network,
		postId: id,
		proposalType
	});
	return { props: { error, network, post: data, status } };
};

interface IReferendaPostProps {
	post: IPostResponse;
	error?: string;
	network: string;
	status?: number;
}

const ReferendaPost: FC<IReferendaPostProps> = ({ post, error, network }) => {
	const dispatch = useDispatch();
	// const [openNudge, setOpenNudge] = useState(false);

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	// Calculate trackName outside of the conditional blocks
	let trackName = '';
	if (isOpenGovSupported(network)) {
		for (const key of Object.keys(networkTrackInfo?.[network])) {
			if (post && networkTrackInfo[network][key].trackId === post.track_number && !('fellowshipOrigin' in networkTrackInfo[network][key])) {
				trackName = key;
			}
		}
	}

	if (post) {
		return (
			<>
				<SEOHead
					title={post.title || `${noTitle} - Referenda V2`}
					desc={post.content}
					network={network}
				/>
				{/* <ConfusedNudge
					postIndex={post?.post_id}
					postType={proposalType}
					status={post?.status}
					title={post?.title || ''}
					setOpenNudge={setOpenNudge}
				/> */}
				{/* Main content */}
				{/* <div className={`transition-opacity duration-500 ${openNudge ? 'mt-7' : 'mt-0'}`}> */}
				<div className={'mt-0 transition-opacity duration-500'}>
					{trackName && <BackToListingView trackName={trackName} />}

					<div className='mt-6'>
						<Post
							post={post}
							trackName={trackName === 'Root' ? 'root' : trackName}
							proposalType={proposalType}
						/>
					</div>
				</div>
			</>
		);
	} else if (error) {
		return (
			<div className='mt-20 flex flex-col items-center justify-center'>
				<div className='flex items-center gap-5'>
					<FrownOutlined className=' -mt-5 text-4xl text-pink_primary dark:text-blue-dark-high' /> <h1 className='text-6xl font-bold'>404</h1>
				</div>
				<p className='mt-2 text-lg text-gray-500'>Post not found in the {trackName || 'specified'} category. If you just created a post, it might take up to a minute to appear.</p>
				<div className='mt-5'>
					<BackToListingView postCategory={PostCategory.REFERENDA} />
				</div>
			</div>
		);
	}

	return (
		<div className='mt-16'>
			<LoadingState />
		</div>
	);
};

export default memo(ReferendaPost);
