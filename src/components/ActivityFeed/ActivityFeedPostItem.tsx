// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { Divider } from 'antd';
import { EAllowedCommentor, ILastVote } from '~src/types';
import { ProposalType } from '~src/global/proposalType';
import dynamic from 'next/dynamic';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import { ActivityFeedPostHeader } from './ActivityFeedPostHeader';
import { ActivityFeedPostReactions } from './ActivityFeedPostReactions';
import { ActivityFeedPostActions } from './ActivityFeedPostActions';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useApiContext } from '~src/context';
import { BN } from 'bn.js';
import _ from 'lodash';
import Skeleton from '~src/basic-components/Skeleton';
import getCommentDisabledMessage from '../Post/Comment/utils/getCommentDisabledMessage';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import ActivityFeedCommentSection from './ActivityFeedCommentSection';
import ActivityFeedPostContent from './ActivityFeedPostContent';
import DarkCastVoteIcon from '~assets/icons/cast-vote-icon-white.svg';
import styled from 'styled-components';

const ZERO = new BN(0);

const VoteReferendumModal = dynamic(() => import('../Post/GovernanceSideBar/Referenda/VoteReferendumModal'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const NO_CONTENT_FALLBACK = 'No content available for this post.';

const ActivityFeedPostItem: React.FC<any> = ({ post }: { post: any }) => {
	const currentUserdata = useUserDetailsSelector();
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;
	const fullContent = post?.summary || NO_CONTENT_FALLBACK;
	const [showModal, setShowModal] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [updateTally, setUpdateTally] = useState<boolean>(false);
	const onAccountChange = (address: string) => setAddress(address);
	const { api, apiReady } = useApiContext();
	const [lastVote, setLastVote] = useState<ILastVote | null>(null);
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [identity, setIdentity] = useState<boolean>(true);
	const { network } = useNetworkSelector();
	const { post_reactions } = post;
	const { resolvedTheme: theme } = useTheme();
	const handleIdentityInfo = async () => {
		if (!api || !currentUserdata?.addresses || !apiReady) return;

		const verifiedInfoPromises = currentUserdata?.addresses?.map(async (address) => {
			const info = await getIdentityInformation({
				address,
				api,
				network
			});
			return info;
		});

		const identities = await Promise.all(verifiedInfoPromises);

		const verifiedIdentity = identities?.some((info) => info?.isVerified);
		setIdentity(verifiedIdentity);
	};

	const allowedCommentorsFromPost = post?.allowedCommentors || EAllowedCommentor.ALL;
	const isUserNotAllowedToComment = allowedCommentorsFromPost === EAllowedCommentor.NONE || (allowedCommentorsFromPost === EAllowedCommentor.ONCHAIN_VERIFIED && !identity);
	const reasonForNoComment = getCommentDisabledMessage(allowedCommentorsFromPost, identity);
	const VoteIcon = styled(DarkCastVoteIcon)`
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	`;
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [reactionState, setReactionState] = useState({
		dislikesCount: post_reactions?.['👎']?.count || 0,
		dislikesImages: [],
		dislikesUserIds: post_reactions?.['👎']?.userIds || [],
		dislikesUsernames: post_reactions?.['👎']?.usernames || [],
		likesCount: post_reactions?.['👍']?.count || 0,
		likesImages: [],
		likesUserIds: post_reactions?.['👍']?.userIds || [],
		likesUsernames: post_reactions?.['👍']?.usernames || [],
		userDisliked: post_reactions?.['👎']?.usernames?.includes(currentUserdata?.username) || false,
		userLiked: post_reactions?.['👍']?.usernames?.includes(currentUserdata?.username) || false
	});

	const [tallyData, setTallyData] = useState({
		ayes: post?.tally?.ayes ? (String(post?.tally?.ayes).startsWith('0x') ? new BN(post?.tally?.ayes.slice(2), 'hex') : new BN(post?.tally?.ayes)) : ZERO,
		nays: post?.tally?.nays ? (String(post?.tally?.nays).startsWith('0x') ? new BN(post?.tally?.nays.slice(2), 'hex') : new BN(post?.tally?.nays)) : ZERO,
		support: post?.tally?.support ? (String(post?.tally?.support).startsWith('0x') ? new BN(post?.tally?.support.slice(2), 'hex') : new BN(post?.tally?.support)) : ZERO
	});

	const handleTallyData = async (tally: any) => {
		if (!api || !apiReady) return;
		if (['confirmed', 'executed', 'timedout', 'cancelled', 'rejected', 'executionfailed'].includes(status.toLowerCase())) {
			setTallyData({
				ayes: String(tally?.ayes).startsWith('0x') ? new BN(tally?.ayes || 0, 'hex') : new BN(tally?.ayes || 0),
				nays: String(tally?.nays).startsWith('0x') ? new BN(tally?.nays || 0, 'hex') : new BN(tally?.nays || 0),
				support: String(tally?.support).startsWith('0x') ? new BN(tally?.support || 0, 'hex') : new BN(tally?.support || 0)
			});
			setIsLoading(false);
			return;
		}

		try {
			const referendumInfoOf = await api?.query?.referenda?.referendumInfoFor(post?.post_id);
			const parsedReferendumInfo: any = referendumInfoOf?.toJSON();
			if (parsedReferendumInfo?.ongoing?.tally) {
				setTallyData({
					ayes:
						typeof parsedReferendumInfo.ongoing.tally.ayes === 'string'
							? new BN(parsedReferendumInfo.ongoing.tally.ayes.slice(2), 'hex')
							: new BN(parsedReferendumInfo.ongoing.tally.ayes),
					nays:
						typeof parsedReferendumInfo.ongoing.tally.nays === 'string'
							? new BN(parsedReferendumInfo.ongoing.tally.nays.slice(2), 'hex')
							: new BN(parsedReferendumInfo.ongoing.tally.nays),
					support:
						typeof parsedReferendumInfo.ongoing.tally.support === 'string'
							? new BN(parsedReferendumInfo.ongoing.tally.support.slice(2), 'hex')
							: new BN(parsedReferendumInfo.ongoing.tally.support)
				});
				setIsLoading(false);
			} else {
				setTallyData({
					ayes: new BN(tally?.ayes || 0, 'hex'),
					nays: new BN(tally?.nays || 0, 'hex'),
					support: new BN(tally?.support || 0, 'hex')
				});
				setIsLoading(false);
			}
		} catch (err) {
			setTallyData({
				ayes: new BN(tally?.ayes || 0, 'hex'),
				nays: new BN(tally?.nays || 0, 'hex'),
				support: new BN(tally?.support || 0, 'hex')
			});
			setIsLoading(false);
		}
	};
	const handleSummaryReload = async () => {
		setIsLoading(true);
		const { data, error } = await nextApiClientFetch<{
			tally: {
				ayes: string;
				nays: string;
				support: string;
				bareAyes: string;
			};
		}>('/api/v1/getTallyVotesData', {
			postId: post?.post_id,
			proposalType: ProposalType.REFERENDUM_V2
		});

		if (data) {
			handleTallyData(data?.tally);
		} else if (error) {
			console.log(error);
		}
		setIsLoading(false);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleDebounceTallyData = useCallback(_.debounce(handleSummaryReload, 10000), [updateTally]);

	useEffect(() => {
		setIsLoading(true);
		handleDebounceTallyData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [updateTally]);

	useEffect(() => {
		if (currentUserdata?.addresses) {
			handleIdentityInfo();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentUserdata, apiReady, api, network]);

	return (
		<div className='hover:scale-30 rounded-2xl border-[0.6px] border-solid border-[#D2D8E0] bg-white  px-5 pb-6 pt-5 font-poppins  hover:shadow-md dark:border-solid dark:border-[#4B4B4B] dark:bg-[#0D0D0D] md:px-7'>
			<>
				<ActivityFeedPostHeader
					post={post}
					tallyData={tallyData}
					updateTally={updateTally}
					isLoading={isLoading}
					setUpdateTally={setUpdateTally}
				/>
				<Link
					href={`/referenda/${post?.post_id}`}
					passHref
				>
					<ActivityFeedPostContent
						post={post}
						content={fullContent}
						isCommentPost={false}
					/>
					{(reactionState.likesCount > 0 || reactionState.dislikesCount > 0 || post?.commentsCount > 0) && (
						<ActivityFeedPostReactions
							reactionState={reactionState}
							post={post}
						/>
					)}
				</Link>
				<Divider
					className={`m-0 rounded-lg border-[0.6px] border-solid border-[#D2D8E0] p-0 dark:border-[#4B4B4B] ${
						reactionState?.likesCount === 0 && reactionState?.dislikesCount === 0 && post?.commentsCount === 0 ? 'mt-3' : ''
					}`}
				/>
				<ActivityFeedPostActions
					post={post}
					reactionState={reactionState}
					setReactionState={setReactionState}
					isUserNotAllowedToComment={isUserNotAllowedToComment}
				/>
				<ActivityFeedCommentSection
					post={post}
					reasonForNoComment={reasonForNoComment || ''}
					isUserNotAllowedToComment={isUserNotAllowedToComment}
				/>
				{isMobile && (
					<div
						onClick={() => {
							if (currentUserdata && currentUserdata?.id) {
								setShowModal(true);
							} else {
								setModalOpen(true);
							}
						}}
						className='m-0 mt-3 flex cursor-pointer items-center justify-center gap-1 rounded-lg border-[1px] border-solid  border-[#E5007A] p-0 px-3 text-pink_primary'
					>
						<VoteIcon className=' mt-[1px]' />
						<p className='cursor-pointer pt-3 font-medium'> {!lastVote ? 'Cast Vote' : 'Cast Vote Again'}</p>
					</div>
				)}
				{showModal && (
					<VoteReferendumModal
						onAccountChange={onAccountChange}
						address={address}
						proposalType={ProposalType.REFERENDUM_V2}
						setLastVote={setLastVote}
						setShowModal={setShowModal}
						showModal={showModal}
						referendumId={post?.post_id}
						trackNumber={post?.track_no}
						setUpdateTally={setUpdateTally}
						updateTally={updateTally}
					/>
				)}
				<ReferendaLoginPrompts
					theme={theme}
					modalOpen={modalOpen}
					setModalOpen={setModalOpen}
					image='/assets/Gifs/login-vote.gif'
					title={'Join Polkassembly to Vote on this proposal.'}
					subtitle='Discuss, contribute and get regular updates from Polkassembly.'
				/>
			</>
		</div>
	);
};

export default ActivityFeedPostItem;
