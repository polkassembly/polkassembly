// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getSubSquareComments } from 'pages/api/v1/posts/comments/subsquare-comments';
import { getOnChainPost, IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useEffect } from 'react';
import Post from 'src/components/Post/Post';
import BackToListingView from 'src/ui-components/BackToListingView';
import { ErrorState, LoadingState,PostEmptyState } from 'src/ui-components/UIStates';
import { useState } from 'react';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useNetworkContext } from '~src/context';
import { noTitle } from '~src/global/noTitle';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { useRouter } from 'next/router';
import { checkIsOnChain } from '~src/util/checkIsOnChain';
import EmptyIcon from '~assets/icons/empty-state-image.svg';
import { useApiContext } from '~src/context';

const proposalType = ProposalType.OPEN_GOV;
export const getServerSideProps:GetServerSideProps = async ({ req, query }) => {
	const { id } = query;

	const network = getNetworkFromReqHeaders(req.headers);
	const { data, error ,status } = await getOnChainPost({
		network,
		postId: id,
		proposalType
	});
	const comments = await getSubSquareComments(proposalType, network, id);
	const post = data && { ...data, comments: [...data.comments, ...comments] };
	return { props: { error, network, post, status } };
};

interface IReferendaPostProps {
	post: IPostResponse;
	error?: string;
	network: string;
	status?: number;
}

const ReferendaPost: FC<IReferendaPostProps> = (props) => {
	const { post, error, network , status } = props;
	const { setNetwork } = useNetworkContext();
	const router = useRouter();
	const { id } = router.query;
	const [isUnfinalized,setIsUnFinalized] = useState(false);
	const { api, apiReady } = useApiContext();

	useEffect(() => {
		setNetwork(props.network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {

		if(!api || !apiReady || !error || !status || !id || status !== 404 ){
			return;
		}
		(async() => {
			setIsUnFinalized( Boolean(await checkIsOnChain(String(id),proposalType, api)));
		})();

	}, [api, apiReady, error, status,id]);

	if(isUnfinalized){
		return <PostEmptyState image={<EmptyIcon/>} description={<div className='p-5'><b className='text-xl my-4'>Waiting for Block Confirmation</b><p>Usually its done within a few seconds</p></div>} imageStyle={ { height:300  } }/>;
	}

	if (error) return <ErrorState errorMessage={error} />;

	if (post) {
		let trackName = '';
		for (const key of Object.keys(networkTrackInfo[props.network])) {
			if(networkTrackInfo[props.network][key].trackId == post.track_number && !('fellowshipOrigin' in networkTrackInfo[props.network][key])) {
				trackName = key;
			}
		}
		console.log('post' , post);
		return <>
			<SEOHead title={post.title || `${noTitle} - Referenda V2`} desc={post.content} network={network}/>

			{trackName && <BackToListingView trackName={trackName} />}

			<div className='mt-6'>
				<Post post={post} trackName={trackName === 'Root' ? 'root' : trackName} proposalType={proposalType} />
			</div>
		</>;
	}

	return <div className='mt-16'><LoadingState /></div>;

};

export default ReferendaPost;
