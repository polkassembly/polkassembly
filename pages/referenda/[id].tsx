// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getOnChainPost, IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, memo, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Post from 'src/components/Post/Post';
import BackToListingView from 'src/ui-components/BackToListingView';
import { FrownOutlined } from '@ant-design/icons';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import LoadingState from '~src/basic-components/Loading/LoadingState';
import { noTitle } from '~src/global/noTitle';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { getStatusesFromCustomStatus, ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import { useGlobalSelector } from '~src/redux/selectors';
import ConfusionModal from '~src/ui-components/ConfusionModal';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import ImageIcon from '~src/ui-components/ImageIcon';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { PostCategory } from '~src/global/post_categories';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';

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
	const { is_sidebar_collapsed } = useGlobalSelector();

	const [isModalOpen, setModalOpen] = useState(false);
	const [isContentVisible, setContentVisible] = useState(true);
	const [isNudgeVisible, setNudgeVisible] = useState(false);

	const handleToggleContent = () => {
		setContentVisible(false);
	};

	useEffect(() => {
		dispatch(setNetwork(network));
		if (post?.status === getStatusesFromCustomStatus(CustomStatus.Active)) {
			const nudgeTimeout = setTimeout(() => {
				setNudgeVisible(true);
			}, 180000);

			return () => {
				if (nudgeTimeout) {
					clearTimeout(nudgeTimeout);
				}
			};
		}
	}, [dispatch, post?.status, network]);

	// Calculate trackName outside of the conditional blocks
	let trackName = '';
	for (const key of Object.keys(networkTrackInfo[network])) {
		if (post && networkTrackInfo[network][key].trackId === post.track_number && !('fellowshipOrigin' in networkTrackInfo[network][key])) {
			trackName = key;
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
								<p>Share proposal</p>
							</div>
							<p className='pt-3'>with a friend to get their opinion!</p>
						</div>
						<div onClick={handleToggleContent}>
							<CloseIcon className='cursor-pointer pt-[10px] text-2xl' />
						</div>
					</div>
				)}
				{/* Main content */}
				<div className={`transition-opacity duration-500 ${isContentVisible ? 'mt-7' : 'mt-0'}`}>
					{trackName && <BackToListingView trackName={trackName} />}

					<div className='mt-6'>
						<Post
							post={post}
							trackName={trackName === 'Root' ? 'root' : trackName}
							proposalType={proposalType}
						/>
					</div>
				</div>

				{/* Confusion Modal */}
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
