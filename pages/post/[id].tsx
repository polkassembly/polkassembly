// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getOffChainPost } from 'pages/api/v1/posts/off-chain-post';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { PostCategory } from 'src/global/post_categories';
import BackToListingView from 'src/ui-components/BackToListingView';
import { ErrorState } from 'src/ui-components/UIStates';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import LoadingState from '~src/basic-components/Loading/LoadingState';
import Post from '~src/components/Post/Post';
import { noTitle } from '~src/global/noTitle';
import { OffChainProposalType, ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import SpamPostBanner from '~src/ui-components/SpamPostBanner';
import SpamPostModal from '~src/ui-components/SpamPostModal';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { id } = query;

	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { data, error } = await getOffChainPost({
		network,
		postId: id,
		proposalType: OffChainProposalType.DISCUSSIONS
	});
	return { props: { error, network, post: data } };
};

interface IDiscussionPostProps {
	post: IPostResponse;
	error?: string;
	network: string;
}
const DiscussionPost: FC<IDiscussionPostProps> = (props) => {
	const { post, error, network } = props;
	const [openSpamModal, setOpenSpamModal] = useState(false);
	const [isBannerVisible, setIsBannerVisible] = useState(false);
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!post) return;
		const isSpam = (!!post?.spam_users_count && post?.spam_users_count > 0) || post?.isSpamDetected || false;
		setIsBannerVisible(isSpam);
		setOpenSpamModal(isSpam);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [post]);

	if (error)
		return (
			<ErrorState
				errorMessage={error}
				isRefreshBtnVisible={!error?.includes('not found') && !post?.isSpamDetected}
				showMoreDiscussions
			/>
		);

	if (post?.isSpamDetected || post?.spam_users_count)
		return (
			<div className='mt-16'>
				<div className='flex flex-col items-center justify-center'>
					<Image
						src='/assets/Gifs/spam-gif.gif'
						alt='spam post'
						width={200}
						height={200}
					/>
					<h1 className='mt-8 text-lg font-bold text-bodyBlue dark:text-blue-dark-high'>This post has been deleted.</h1>
					<p className='text-center text-sm text-lightBlue dark:text-blue-dark-medium'>
						This post was flagged as spam by users, if you think there is an error,{' '}
						<Link
							href='https://polkassembly.featureos.app/'
							className='text-pink_primary underline'
							target='_blank'
						>
							raise a ticket
						</Link>
					</p>
					<CustomButton
						variant='primary'
						text='Back to Feed'
						size='large'
						className='mt-4 w-[556px] transition-colors duration-300 max-md:w-full'
					>
						<Link
							href='/discussions'
							className='hover:text-white'
						>
							Back to Feed
						</Link>
					</CustomButton>
				</div>
			</div>
		);

	if (post && !post?.spam_users_count && !post?.isSpamDetected)
		return (
			<>
				<SEOHead
					title={post.title || `${noTitle} Discussion`}
					desc={post.content}
					network={network}
				/>
				{isBannerVisible && <SpamPostBanner />}
				<div className={`${isBannerVisible && 'mt-8 max-sm:mt-2'}`}>
					<BackToListingView postCategory={PostCategory.DISCUSSION} />
				</div>

				<SpamPostModal
					open={openSpamModal}
					setOpen={setOpenSpamModal}
					proposalType={ProposalType.DISCUSSIONS}
				/>
				<div className='mt-6'>
					<Post
						post={post}
						proposalType={ProposalType.DISCUSSIONS}
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

export default DiscussionPost;
