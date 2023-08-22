// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton, Tabs } from 'antd';
import { dayjs } from 'dayjs-init';
import dynamic from 'next/dynamic';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useContext, useEffect, useState } from 'react';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import { PostEmptyState } from 'src/ui-components/UIStates';

import { isOffChainProposalTypeValid } from '~src/api-utils';
import PostDataContextProvider from '~src/context/PostDataContext';
import { checkIsOnChainPost, getFirestoreProposalType, ProposalType } from '~src/global/proposalType';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

import OtherProposals from '../OtherProposals';
import SidebarRight from '../SidebarRight';
import OptionPoll from './ActionsBar/OptionPoll';
import TrackerButton from './ActionsBar/TrackerButton';
import EditablePostContent from './EditablePostContent';
import PostHeading from './PostHeading';
import getNetwork from '~src/util/getNetwork';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IVerified } from '~src/auth/types';
import SpamAlert from '~src/ui-components/SpamAlert';
import { useNetworkContext } from '~src/context';
import Link from 'next/link';
import LinkCard from './LinkCard';
import { IDataType, IDataVideoType } from './Tabs/PostTimeline/Audit';
import styled from 'styled-components';
import StickyBox from 'react-sticky-box';
import ScrollToTopButton from '~src/ui-components/ScrollToTop';

const PostDescription = dynamic(() => import('./Tabs/PostDescription'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

const PostAudit = dynamic(() => import('./Tabs/PostTimeline/Audit'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

const GovernanceSideBar = dynamic(() => import('./GovernanceSideBar'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

const Poll = dynamic(() => import('./Poll'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

const PostTimeline = dynamic(() => import('./Tabs/PostTimeline'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

const ClaimPayoutModal = dynamic(() => import('./ClaimPayoutModal'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

const PostOnChainInfo = dynamic(() => import('./Tabs/PostOnChainInfo'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

interface IPostProps {
	className?: string;
	post: IPostResponse;
	trackName?: string;
	proposalType: ProposalType;
}

function formatDuration(duration: any) {
	const dayjsDuration = dayjs.duration(duration);
	const days = Math.floor(dayjsDuration.asDays());
	const hours = dayjsDuration.hours();
	const minutes = dayjsDuration.minutes();

	return days + 'd ' + hours + 'h ' + minutes + 'm ';
}

const Post: FC<IPostProps> = (props) => {
	const {
		className,
		post,
		trackName,
		proposalType
	} = props;

	const { id, addresses } = useContext(UserDetailsContext);
	const [isEditing, setIsEditing] = useState(false);
	const toggleEdit = () => setIsEditing(!isEditing);
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
	const [proposerAddress, setProposerAddress] = useState<string>('');
	const [canEdit, setCanEdit] = useState(false);
	const { network } = useNetworkContext();
	const [duration, setDuration] = useState(dayjs.duration(0));
	const [totalAuditCount, setTotalAuditCount] = useState<number>(0);
	const [totalVideoCount, setTotalVideoCount] = useState<number>(0);
	const [auditData, setAuditData] = useState<IDataType[]>([]);
	const [videoData, setVideoData] = useState<IDataVideoType[]>([]);
	const isOnchainPost = checkIsOnChainPost(proposalType);
	const isOffchainPost = !isOnchainPost;

	useEffect(() => {
		if(!post) return;

		const { post_id, proposer } = post;

		if(isOffchainPost) {
			setCanEdit(post.user_id === id);
			return;
		}

		let isProposer = proposer && addresses?.includes(getSubstrateAddress(proposer) || proposer);
		const network = getNetwork();
		if(network == 'moonbeam' && proposalType == ProposalType.DEMOCRACY_PROPOSALS && post_id == 23){
			isProposer = addresses?.includes('0xbb1e1722513a8fa80f7593617bb0113b1258b7f1');
		}
		if(network == 'moonriver' && proposalType == ProposalType.REFERENDUM_V2 && post_id == 3){
			isProposer = addresses?.includes('0x16095c509f728721ad19a51704fc39116157be3a');
		}

		const substrateAddress = getSubstrateAddress(proposer);
		if(!isProposer || !substrateAddress) return;

		(async () => {
			//check if proposer address is verified
			const { data , error: fetchError } = await nextApiClientFetch<IVerified>( 'api/v1/auth/data/isAddressVerified', {
				address: substrateAddress
			});

			if(fetchError || !data) return console.log('error checking verified address : ', fetchError);

			if(data.verified && !isEditing) {
				setCanEdit(true);
			}
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addresses, id, isEditing, post, proposalType]);

	useEffect(() => {
		if (proposalType !== ProposalType.GRANTS || dayjs(post.created_at).isBefore(dayjs().subtract(6, 'days'))) return;

		let timeoutId: any;

		const updateDuration = () => {
			const currentTime = dayjs();
			const desiredTime = dayjs(post.created_at).add(6, 'days');
			const newDuration = dayjs.duration(desiredTime.diff(currentTime));
			setDuration(newDuration);

			timeoutId = setTimeout(updateDuration, 60000);
		};

		updateDuration();

		return () => clearTimeout(timeoutId);
	}, [post.created_at, proposalType]);

	useEffect(() => {
		if (post && post.timeline && Array.isArray(post.timeline)) {
			let isFind = false;
			const map = new Map();
			post.timeline.forEach((obj) => {
				if (obj && obj.index === post.post_id && obj.type === post.type) {
					isFind = true;
				} else if (isFind) {
					map.set(obj.type, obj);
				}
			});
			let nextPost: any = undefined;
			map.forEach((v) => {
				if (!nextPost) {
					nextPost = v;
				}
			});
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [post]);

	const networkModified =  network?.charAt(0)?.toUpperCase() + network?.slice(1);
	let postType:any = proposalType;

	if(postType === ProposalType.REFERENDUM_V2){
		postType = 'OpenGov';
	}
	else if(postType === ProposalType.DISCUSSIONS){
		postType = 'Discussion';
	}
	const productData = async () => {
		try {
			const response = await fetch(`https://api.github.com/repos/CoinStudioDOT/OpenGov/contents/${networkModified}/${postType}/${postType === ProposalType.TIPS? post.hash: post.post_id}`,
				{
					headers: {
						'Accept': 'application/vnd.github.v3+json',
						'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
						'X-GitHub-Api-Version': '2022-11-28'
					}
				}
			);
			if (response.ok) {
				const data = await response.json();
				setAuditData(data);
				const count = (data.filter((file: any) => file.name.endsWith('.pdf') || file.name.endsWith('.png'))).length || 0;
				setTotalAuditCount(count);

			} else {
				// throw new Error('Request failed');
			}
		} catch (error) {
			// console.log('Error:', error);
		}

	};
	const videosData = async () => {
		try {
			const response = await fetch(`https://api.github.com/repos/CoinStudioDOT/OpenGov/contents/${networkModified}/${postType}/${postType === ProposalType.TIPS? post.hash: post.post_id}/video.json`,
				{
					headers: {
						'Accept': 'application/vnd.github.v3+json',
						'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
						'X-GitHub-Api-Version': '2022-11-28'
					}
				});
			if (response.ok) {
				const data = await response.json();
				const decoded = atob(data.content).replace(/}\s*{/g, '}, {');
				setVideoData(JSON.parse(decoded) as IDataVideoType[]);
				setTotalVideoCount(JSON.parse(decoded).length);

			} else {
				// throw new Error('Request failed');
			}
		} catch (error) {
			// console.log('Error:', error);
		}
	};

	useEffect(() => {
		productData().then(() => {});
		videosData().then(() => {});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	if (!post) {
		return (
			<div className='mt-16'>
				<PostEmptyState postCategory={proposalType} />
			</div>
		);
	}
	const { post_id, hash, status: postStatus } = post;
	const onchainId = proposalType === ProposalType.TIPS? hash :post_id;

	const Sidebar = ({ className } : {className?:string}) => {
		return (
			<div className={`${className} flex flex-col w-full xl:col-span-4`}>
				<StickyBox offsetTop={20} offsetBottom={50} className="mb-6">
					<GovernanceSideBar
						toggleEdit={toggleEdit}
						proposalType={proposalType}
						onchainId={onchainId}
						status={postStatus}
						canEdit={canEdit}
						startTime={post.created_at}
						post={post}
						tally={post?.tally}
						className={`${!isOffchainPost}`}
						trackName={trackName}
					/>
				</StickyBox>
				{
					isOffchainPost &&
					<div className={'sticky top-[65px] mb-6 '}>
						<Poll
							proposalType={proposalType}
							postId={post.post_id}
							canEdit={post.user_id === id}
						/>
						<OptionPoll
							proposalType={proposalType}
							postId={proposalType === ProposalType.TIPS? post.hash: post.post_id}
							canEdit={post.user_id === id}
						/>
					</div>
				}
			</div>
		);
	};

	const TrackerButtonComp = <>
		{id && !isNaN(Number(onchainId)) && isOnchainPost && !isEditing &&
			<TrackerButton
				onchainId={onchainId}
				proposalType={proposalType}
			/>
		}
	</>;

	const handleOpenSidebar = (address:string) => {
		setSidebarOpen(true);
		setProposerAddress(address);
	};
	const getOnChainTabs = () => {
		const tabs: any[] = [
			{
				children: (
					<PostTimeline />
				),
				key: 'timeline',
				label: 'Timeline'
			}
		];
		if (['polkadot', 'kusama'].includes(network)){
			tabs.push({
				children: (
					<PostAudit auditData={auditData} videoData={videoData}/>
				),
				key: 'audit',
				label:<div className='flex gap-2 items-center justify-center audit'>
          Audit
					{(totalAuditCount + totalVideoCount) > 0 && <span className='bg-[#d6d8da] card-bg text-xs font-medium rounded-full px-1.5 text-bodyBlue py-0.5'>{totalAuditCount + totalVideoCount}</span>
					}          </div>
			});
		}

		if (!isOffChainProposalTypeValid(proposalType)) {
			tabs.push({
				children: (
					<PostOnChainInfo
						onChainInfo={{
							bond: post?.bond,
							cid: post?.cid,
							code: post?.code,
							codec: post?.codec,
							curator: post?.curator,
							curator_deposit: post?.curator_deposit,
							deciding: post?.deciding,
							decision_deposit_amount: post?.decision_deposit_amount,
							delay: post?.delay,
							deposit: post?.deposit,
							description: post?.description,
							enactment_after_block: post.enactment_after_block,
							enactment_at_block: post.enactment_at_block,
							end: post?.end,
							ended_at: post?.ended_at,
							ended_at_block: post?.ended_at_block,
							fee: post?.fee,
							hash: post?.hash,
							member_count: post?.member_count,
							method: post?.method,
							motion_method: post?.motion_method,
							origin: post?.origin,
							payee: post?.payee,
							post_id: post?.post_id,
							proposal_arguments: post?.proposal_arguments,
							proposed_call: post?.proposed_call,
							proposer: post?.proposer,
							reward: post?.reward,
							status: post?.status,
							statusHistory: post?.statusHistory,
							submission_deposit_amount: post?.submission_deposit_amount,
							submitted_amount: post?.submitted_amount,
							track_number: post?.track_number,
							version: post?.version,
							vote_threshold: post?.vote_threshold
						}}
						handleOpenSidebar={handleOpenSidebar}
						proposalType={proposalType}
					/>
				),
				key: 'onChainInfo',
				label: 'On Chain Info'
			});
		}

		return tabs;
	};

	const tabItems: any[] = [
		{
			children: <PostDescription
				id={id}
				isEditing={isEditing}
				canEdit={canEdit}
				toggleEdit={toggleEdit}
				isOnchainPost={isOnchainPost}
				TrackerButtonComp={TrackerButtonComp}
				Sidebar={() => <Sidebar />}
			/>,
			key: 'description',
			label: 'Description'
		},
		...getOnChainTabs()
	];
	return (
		<PostDataContextProvider initialPostData={{
			cid: post?.cid || '',
			comments: post?.comments || [],
			content: post?.content,
			created_at: post?.created_at || '',
			curator: post?.curator || '',
			currentTimeline: post.currentTimeline,
			description: post?.description,
			history: post?.history || [],
			last_edited_at: post?.last_edited_at,
			postIndex: proposalType === ProposalType.TIPS? post.hash: post.post_id ,
			postType: proposalType,
			post_link: post?.post_link,
			post_reactions: post?.post_reactions,
			proposer: post?.proposer || '',
			requested: post?.requested,
			reward: post?.reward,
			spam_users_count: post?.spam_users_count,
			status: post?.status,
			statusHistory: post?.statusHistory,
			subscribers: post?.subscribers || [],
			summary: post?.summary,
			tags: post?.tags || [],
			timeline: post?.timeline,
			title: post?.title || '',
			topic: post?.topic || '',
			track_name: trackName,
			track_number: post?.track_number,
			username: post?.username
		}}>
			<>
				<SpamAlert />
				{
					!isEditing && Boolean(post.timeline?.length) && proposalType !==  ProposalType.CHILD_BOUNTIES &&
          ( post?.timeline.length === 1 ? getFirestoreProposalType(post?.timeline[0]?.type) !== proposalType : true  ) && <LinkCard timeline={post?.timeline} proposalType={proposalType}/>
				}
				{
					proposalType === ProposalType.CHILD_BOUNTIES && (post.parent_bounty_index || post.parent_bounty_index === 0) &&
						<Link href={`/bounty/${post.parent_bounty_index}`}>
							<div className='bg-white drop-shadow-md p-3 md:p-6 rounded-md w-full mb-6 dashboard-heading'>
								This is a child bounty of <span className='text-pink_primary'>Bounty #{post.parent_bounty_index}</span>
							</div>
						</Link>
				}
				{ post && proposalType ===  ProposalType.CHILD_BOUNTIES && postStatus === 'PendingPayout' && (
					<div className='bg-white drop-shadow-md p-3 md:p-6 rounded-md  mb-6 dashboard-heading flex items-center gap-x-2 w-full'>
						<span>The child bounty payout is ready to be claimed</span>
						<ClaimPayoutModal
							parentBountyId={post?.parentBountyId}
							childBountyId={onchainId}
						/>
					</div>
				)}

				<div className={`${className} grid grid-cols-1 xl:grid-cols-12 gap-9`}>
					<div className='xl:col-span-8'>
						{
							proposalType === ProposalType.GRANTS && dayjs(post.created_at).isAfter(dayjs().subtract(6, 'days')) &&
						<div className='bg-white drop-shadow-md p-3 md:p-6 rounded-md w-full mb-6 dashboard-heading'>
							This grant will be closed in <span className='text-pink_primary'>{
								formatDuration(duration)
							}</span>
						</div>
						}

						{/* Post Content */}
						<div className='bg-white drop-shadow-md p-3 md:p-4 lg:p-6 rounded-xxl w-full mb-6 '>
							{isEditing &&
              <EditablePostContent toggleEdit={toggleEdit} />}

							{!isEditing && <>
								<PostHeading
									className='mb-8'
								/>
								<Tabs
									type="card"
									className='ant-tabs-tab-bg-white text-bodyBlue font-medium'
									items={tabItems}
								/>

							</>}

						</div>
					</div>

					{!isEditing ? <Sidebar className='hidden xl:block' />: null}
				</div>
				<ScrollToTopButton/>

				<SidebarRight
					open={sidebarOpen}
					closeSidebar={() => setSidebarOpen(false)}
				>
					{ proposerAddress && <OtherProposals proposerAddress={proposerAddress} currPostOnchainID={Number(onchainId)} closeSidebar={() => setSidebarOpen(false)} /> }
				</SidebarRight>
			</>
		</PostDataContextProvider>
	);
};

export default styled(Post)`
.ant-tabs-card >.ant-tabs-nav .ant-tabs-tab-active .ant-tabs-tab-btn .audit .card-bg{
  background-color: var(--pink_primary) !important;
  color: white !important;

}
`;