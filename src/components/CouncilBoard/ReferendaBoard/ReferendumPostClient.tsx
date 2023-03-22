// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useEffect, useState } from 'react';
import Post from 'src/components/Post/Post';
import { PostCategory } from 'src/global/post_categories';
import BackToListingView from 'src/ui-components/BackToListingView';
import { ErrorState, LoadingState } from 'src/ui-components/UIStates';

import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface IReferendumPostClientProps {
	councilBoardSidebar?: boolean;
	postID: string | number;
}

const ReferendumPostClient: FC<IReferendumPostClientProps> = ({ councilBoardSidebar=false, postID }) => {
	const [error, setError] = useState('');
	const [post, setPost] = useState<IPostResponse>();
	const proposalType = ProposalType.REFERENDUMS;
	useEffect(() => {
		nextApiClientFetch<IPostResponse>(`api/v1/posts/on-chain-post?proposalType=${proposalType}&postId=${postID}`)
			.then((res) => {
				if (res.data) {
					setPost(res.data);
				} else if (res.error) {
					setError(res.error);
				}
			})
			.catch((err) => {
				setError(err?.message || err);
			});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postID]);
	if (error) return <ErrorState errorMessage={error} />;

	if (post) return (<div>
		{!councilBoardSidebar && <BackToListingView postCategory={PostCategory.REFERENDA} />}

		<div className='mt-6'>
			<Post post={post} proposalType={proposalType} />
		</div>
	</div>);

	return <div className='mt-16'><LoadingState /></div>;
};

export default ReferendumPostClient;
