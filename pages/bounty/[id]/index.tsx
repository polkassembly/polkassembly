// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getOnChainPost, IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useEffect } from 'react';
import Post from 'src/components/Post/Post';
import { PostCategory } from 'src/global/post_categories';
import BackToListingView from 'src/ui-components/BackToListingView';
import { ErrorState } from 'src/ui-components/UIStates';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { noTitle } from '~src/global/noTitle';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { useRouter } from 'next/router';
import { PostEmptyState } from 'src/ui-components/UIStates';
// import EmptyIcon from '~assets/icons/empty-state-image.svg';
import { checkIsOnChain } from '~src/util/checkIsOnChain';
import { useApiContext } from '~src/context';
import { useState } from 'react';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import LoadingState from '~src/basic-components/Loading/LoadingState';
import { useGlobalSelector } from '~src/redux/selectors';
import ConfusionModal from '~src/ui-components/ConfusionModal';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import ImageIcon from '~src/ui-components/ImageIcon';

const proposalType = ProposalType.BOUNTIES;
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

interface IBountyPostProps {
	post: IPostResponse;
	error?: string;
	network: string;
	status?: number;
}
const BountyPost: FC<IBountyPostProps> = (props) => {
	const { post, error, network, status } = props;
	const dispatch = useDispatch();
	const router = useRouter();
	const { api, apiReady } = useApiContext();
	const { is_sidebar_collapsed } = useGlobalSelector();
	const [isUnfinalized, setIsUnFinalized] = useState(false);
	const { id } = router.query;
	const [isModalOpen, setModalOpen] = useState(false);
	const [isContentVisible, setContentVisible] = useState(true);
	const [isNudgeVisible, setNudgeVisible] = useState(false);

	const handleToggleContent = () => {
		setContentVisible(false);
	};

	useEffect(() => {
		dispatch(setNetwork(props.network));
		if (post?.status == 'Active') {
			const nudgeTimeout = setTimeout(() => {
				setNudgeVisible(true);
			}, 180000);

			return () => clearTimeout(nudgeTimeout);
		}
	}, [dispatch, post?.status, props.network]);

	useEffect(() => {
		if (!api || !apiReady || !error || !status || !id || status !== 404) {
			return;
		}
		(async () => {
			setIsUnFinalized(Boolean(await checkIsOnChain(String(id), proposalType, api)));
		})();
	}, [api, apiReady, error, status, id]);

	if (isUnfinalized) {
		return (
			<PostEmptyState
				description={
					<div className='p-5'>
						<b className='my-4 text-xl'>Waiting for Block Confirmation</b>
						<p>Usually its done within a few seconds</p>
					</div>
				}
			/>
		);
	}

	if (error) return <ErrorState errorMessage={error} />;
	if (!post) return null;

	if (post)
		return (
			<>
				<SEOHead
					title={post.title || `${noTitle} - Bounty`}
					desc={post.content}
					network={network}
				/>
				{isNudgeVisible && (
					<div
						className={`transition-opacity duration-100 ${
							isContentVisible ? 'opacity-100' : 'opacity-0'
						} absolute left-0 top-0 flex w-full justify-between bg-gradient-to-r from-[#D80676] to-[#FF778F] pr-10 ${
							is_sidebar_collapsed ? 'pl-28' : 'pl-[265px]'
						} font-poppins text-[12px] font-medium text-white`}
					>
						<div className='flex gap-2'>
							<p className='pt-3 '>Confused about making a decision?</p>
							<div
								onClick={() => setModalOpen(true)}
								className='mt-2 flex h-6 cursor-pointer gap-2 rounded-md bg-[#0000004D] bg-opacity-[30%] px-2 pt-1'
							>
								<ImageIcon
									src='/assets/icons/transformedshare.svg'
									alt='share icon'
									className='h-4 w-4'
								/>
								<p className=''>Share proposal</p>
							</div>
							<p className='pt-3'>with a friend to get their opinion!</p>
						</div>
						<div onClick={handleToggleContent}>
							<CloseIcon className='cursor-pointer pt-[10px] text-2xl' />
						</div>
					</div>
				)}

				<div className={`transition-opacity duration-500 ${isContentVisible ? 'mt-7' : 'mt-0'}`}>
					<BackToListingView postCategory={PostCategory.BOUNTY} />
					<div className='mt-6'>
						<Post
							post={post}
							proposalType={proposalType}
						/>
					</div>
				</div>

				{isModalOpen && (
					<ConfusionModal
						modalOpen={isModalOpen}
						setModalOpen={setModalOpen}
						className='w-[600px]'
						postId={post.id}
						proposalType={proposalType}
						title={post.title}
					/>
				)}
			</>
		);

	return (
		<div className='mt-16'>
			<LoadingState />
		</div>
	);
};

export default BountyPost;
