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

import { useRouter } from 'next/router';
import { PostEmptyState } from 'src/ui-components/UIStates';
import EmptyIcon from '~assets/icons/empty-state-image.svg';
import { checkIsOnChain } from '~src/util/checkIsOnChain';
import { useApiContext } from '~src/context';
import { useState } from 'react';

const proposalType = ProposalType.TECH_COMMITTEE_PROPOSALS;
export const getServerSideProps:GetServerSideProps = async ({ req, query }) => {
	const { id } = query;

	const network = getNetworkFromReqHeaders(req.headers);
	const { data, error ,status } = await getOnChainPost({
		network,
		postId: id,
		proposalType
	});
	return { props: { data, error, network ,status } };
};

interface ITechCommPostProps {
	data: IPostResponse;
	error?: string;
	network: string;
	status?: number;
}

const TechCommPost: FC<ITechCommPostProps> = (props) => {
	const { data: post, error, network , status } = props;
	const { setNetwork } = useNetworkContext();
	const router = useRouter();
	const { api, apiReady } = useApiContext();
	const [isUnfinalized,setIsUnFinalized] = useState(false);
	const { id } = router.query;

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
		return <PostEmptyState image={<EmptyIcon/>} description={<><b className='text-xl mx-4'>Waiting for Block Confirmation</b><p>Usually its done within a few seconds</p></>} imageStyle={ { height:300 } }/>;
	}

	if (error) return <ErrorState errorMessage={error} />;
	if (!post) return null;

	if (post) return (<>
		<SEOHead title={post.title || `${noTitle} - Tech Comm.`} desc={post.content} network={network}/>

		<BackToListingView postCategory={PostCategory.TECH_COMMITTEE_PROPOSAL} />

		<div className='mt-6'>
			<Post post={post} proposalType={proposalType} />
		</div>
	</>);

	return <div className='mt-16'><LoadingState /></div>;

};

export default TechCommPost;
