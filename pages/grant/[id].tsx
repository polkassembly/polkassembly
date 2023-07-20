// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { GetServerSideProps } from 'next';
import { getOffChainPost } from 'pages/api/v1/posts/off-chain-post';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC } from 'react';
import { PostCategory } from 'src/global/post_categories';
import BackToListingView from 'src/ui-components/BackToListingView';
import { ErrorState, LoadingState } from 'src/ui-components/UIStates';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import Post from '~src/components/Post/Post';
import { noTitle } from '~src/global/noTitle';
import { OffChainProposalType, ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';

export const getServerSideProps: GetServerSideProps = async ({
	req,
	query,
}) => {
	const { id } = query;

	const network = getNetworkFromReqHeaders(req.headers);
	const { data, error } = await getOffChainPost({
		network,
		postId: id,
		proposalType: OffChainProposalType.GRANTS,
	});
	return { props: { data, error, network } };
};

interface IGrantPostProps {
	data: IPostResponse;
	network: string;
	error?: string;
}
const GrantPost: FC<IGrantPostProps> = (props) => {
	const { data: post, error, network } = props;

	if (error) return <ErrorState errorMessage={error} />;

	if (post)
		return (
			<>
				<SEOHead
					title={post.title || `${noTitle} Grant`}
					desc={post.content}
					network={network}
				/>

				<BackToListingView postCategory={PostCategory.GRANT} />

				<div className="mt-6">
					<Post post={post} proposalType={ProposalType.GRANTS} />
				</div>
			</>
		);

	return (
		<div className="mt-16">
			<LoadingState />
		</div>
	);
};

export default GrantPost;
