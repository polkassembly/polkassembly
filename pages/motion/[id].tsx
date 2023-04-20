// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getOnChainPost, IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useEffect } from 'react';
import Post from 'src/components/Post/Post';
import { PostCategory } from 'src/global/post_categories';
import BackToListingView from 'src/ui-components/BackToListingView';
import { ErrorState, LoadingState } from 'src/ui-components/UIStates';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useNetworkContext } from '~src/context';
import { noTitle } from '~src/global/noTitle';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';

const proposalType = ProposalType.COUNCIL_MOTIONS;
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
interface IMotionPostProps {
	data: IPostResponse;
	error?: string;
	network: string;
}

const MotionPost: FC<IMotionPostProps> = (props) => {
	const { data: post, error, network } = props;
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(props.network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) return <ErrorState errorMessage={error} />;
	if (!post) return null;

	if (post) return (<>
		<SEOHead title={post.title || `${noTitle} - Motion`} desc={post.content} network={network}/>

		<BackToListingView postCategory={PostCategory.MOTION} />

		<div className='mt-6'>
			<Post post={post} proposalType={proposalType} />
		</div>
	</>);

	return <div className='mt-16'><LoadingState /></div>;

};

export default MotionPost;
