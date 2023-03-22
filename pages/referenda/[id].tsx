// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getOnChainPost, IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useEffect } from 'react';
import Post from 'src/components/Post/Post';
import BackToListingView from 'src/ui-components/BackToListingView';
import { ErrorState, LoadingState } from 'src/ui-components/UIStates';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useNetworkContext } from '~src/context';
import { noTitle } from '~src/global/noTitle';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';

const proposalType = ProposalType.OPEN_GOV;
export const getServerSideProps:GetServerSideProps = async ({ req, query }) => {
	const { id } = query;

	const network = getNetworkFromReqHeaders(req.headers);
	const { data, error } = await getOnChainPost({
		network,
		postId: id,
		proposalType
	});
	return { props: { data, error, network } };
};

interface IReferendaPostProps {
	data: IPostResponse;
	error?: string;
	network: string
}

const ReferendaPost: FC<IReferendaPostProps> = (props) => {
	const { data: post, error } = props;
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(props.network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) return <ErrorState errorMessage={error} />;

	if (post) {
		let trackName = '';
		for (const key of Object.keys(networkTrackInfo[props.network])) {
			if(networkTrackInfo[props.network][key].trackId == post.track_number && !('fellowshipOrigin' in networkTrackInfo[props.network][key])) {
				trackName = key;
			}
		}

		return <>
			<SEOHead title={post.title || `${noTitle} - Referenda V2`} desc={post.content} />

			{trackName && <BackToListingView trackName={trackName} />}

			<div className='mt-6'>
				<Post post={post} trackName={trackName === 'Root' ? 'root' : trackName} proposalType={proposalType} />
			</div>
		</>;
	}

	return <div className='mt-16'><LoadingState /></div>;

};

export default ReferendaPost;
