// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import {  IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC } from 'react';
import Post from 'src/components/Post/Post';
import { PostCategory } from 'src/global/post_categories';
import BackToListingView from 'src/ui-components/BackToListingView';
import { ErrorState, LoadingState } from 'src/ui-components/UIStates';
import { allianceMotionPost } from '~src/global/collectiveMockData';
import { noTitle } from '~src/global/noTitle';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';

const proposalType = ProposalType.COUNCIL_MOTIONS;
export const getServerSideProps:GetServerSideProps = async () => {
	const { data, error } = {
		data:allianceMotionPost,
		error:null
	};

	return { props: { data, error, network:'collective' } };
};
interface IMotionPostProps {
	data: IPostResponse;
	error?: string;
	network: string;
}

const MotionPost: FC<IMotionPostProps> = (props) => {
	const { data: post, error } = props;

	if (error) return <ErrorState errorMessage={error} />;

	if (!post) return null;

	if (post) return (<>
		<SEOHead title={post.title || `${noTitle} - Motion`} desc={post.content} />
		<BackToListingView postCategory={PostCategory.MOTION} />{/* TODO: Aleem need to discuss about collectives motions proposal, currently using council_motions */}

		<div className='mt-6'>
			<Post post={post} proposalType={proposalType} />
		</div>
	</>);

	return <div className='mt-16'><LoadingState /></div>;

};

export default MotionPost;
