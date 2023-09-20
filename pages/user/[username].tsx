// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Collapse, Select, Tabs } from 'antd';
import { GetServerSideProps } from 'next';
import { getUserProfileWithUsername } from 'pages/api/v1/auth/data/userProfileWithUsername';
import { getDefaultUserPosts, getUserPosts, IUserPostsListingResponse } from 'pages/api/v1/listing/user-posts';
import React, { FC, useEffect, useState } from 'react';
import { useNetworkContext } from 'src/context';
import styled from 'styled-components';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { ProfileDetailsResponse } from '~src/auth/types';
import PostsTab from '~src/components/User/PostsTab';
import Details from '~src/components/UserProfile/Details';
import { EGovType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import CountBadgePill from '~src/ui-components/CountBadgePill';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import UserNotFound from '~assets/user-not-found.svg';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { IconExpand, IconVote, IconDeligation, IconCapital, IconConviction } from '~src/ui-components/CustomIcons';
// import DownArrow from '~assets/icons/down-icon.svg';
// import UpArrow from '~assets/icons/up-arrow.svg';

const { Panel } = Collapse;

// import ExpandIcon from '~assets/Expand.svg';
interface IUserProfileProps {
	userPosts: {
		data: IUserPostsListingResponse;
		error: string | null;
	};
	userProfile: {
		data: ProfileDetailsResponse;
		error: string | null;
	};
	network: string;
	className?: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const req = context.req;
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const username = context.params?.username;
	if (!username) {
		return {
			props: {
				error: 'No username provided'
			}
		};
	}

	const userProfile = await getUserProfileWithUsername(username.toString());
	const userPosts = await getUserPosts({
		addresses: userProfile?.data?.addresses || [],
		network,
		userId: userProfile?.data?.user_id
	});
	const props: IUserProfileProps = {
		network,
		userPosts: {
			data: userPosts.data || getDefaultUserPosts(),
			error: userPosts.error
		},
		userProfile: {
			data: userProfile.data || {
				addresses: [],
				badges: [],
				bio: '',
				image: '',
				social_links: [],
				title: '',
				user_id: 0,
				username: String(username)
			},
			error: userProfile.error
		}
	};
	return {
		props
	};
};

const EmptyState = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;

	svg {
		max-width: 600px;
		margin: auto;
	}
`;

const UserProfile: FC<IUserProfileProps> = (props) => {
	const { userPosts, network, userProfile, className } = props;
	const { setNetwork } = useNetworkContext();
	const [selectedGov, setSelectedGov] = useState(EGovType.GOV1);
	const [voteClicked, setVoteClicked] = useState(true);
	const [postsClicked, setPostsClicked] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);

	useEffect(() => {
		setNetwork(network);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (userPosts.error === 'UserId is invalid') {
		return (
			<EmptyState>
				<ErrorAlert errorMsg="Invalid User. This user does't have any account with Polkassembly" />
				<UserNotFound />
			</EmptyState>
		);
	}
	if (userPosts.error || userProfile.error) {
		return <ErrorAlert errorMsg={userPosts.error || userProfile.error || ''} />;
	}

	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	const tabItems = Object.entries(userPosts.data?.[selectedGov]).map(([key, value]) => {
		if (!value) return null;
		let count = 0;
		if (Array.isArray(value)) {
			count = value.length;
		} else {
			Object.values(value).forEach((v) => {
				if (v && Array.isArray(v)) {
					count += v.length;
				}
			});
		}
		return {
			children: <PostsTab posts={value} />,
			key: key,
			label: (
				<CountBadgePill
					label={key?.split('_').join(' ') || ''}
					count={count}
				/>
			)
		};
	});

	const voteInfo = () => {
		return (
			<>
				<div
					className='w-55 flex h-[164px]'
					style={{ backgroundColor: '#FFF' }}
				>
					<div className='relative top-[14px] px-3'>
						<p className='text-xs text-lightBlue'>Vote Details:</p>
						<div className='flex'>
							<div
								className='h-[100px] w-[390px] justify-start'
								style={{ borderRight: '0.8px dashed #d2d8e0' }}
							>
								<p className='relative top-[4px] text-xs font-semibold text-bodyBlue'>Self Votes</p>
								<div>
									<div className='relative top-[4px] flex'>
										<IconVote className='relative' />
										<p className='history-text relative left-[6px] m-0 p-0 text-xs'>Votes</p>
										<p className='history-text relative left-[182px] m-0 p-0 text-xs'>150 DOTS</p>
									</div>
									<div className='relative top-[12px] flex'>
										<IconConviction className='relative' />
										<p className='history-text relative left-[6px] m-0 p-0 text-xs'>Conviction</p>
										<p className='history-text relative left-[152px] m-0 p-0 text-xs'>150 DOTS</p>
									</div>
									<div className='relative top-[20px] flex'>
										<IconCapital className='relative' />
										<p className='history-text relative left-[6px] m-0 p-0 text-xs'>Capital</p>
										<p className='history-text relative left-[173px] m-0 p-0 text-xs'>150 DOTS</p>
									</div>
								</div>
							</div>
							<div className='relative left-[92px] h-[100px] w-[380px] justify-end px-[12px] py-0'>
								<p className='relative top-[4px] text-xs font-semibold text-bodyBlue'>Delegations Votes</p>
								<div>
									<div className='relative top-[4px] flex'>
										<IconVote className='relative' />
										<p className='history-text relative left-[6px] m-0 p-0 text-xs'>Votes</p>
										<p className='history-text relative left-[182px] m-0 p-0 text-xs'>150 DOTS</p>
									</div>
									<div className='relative top-[12px] flex'>
										<IconDeligation className='relative' />
										<p className='history-text relative left-[6px] m-0 p-0 text-xs'>Delegators</p>
										<p className='history-text relative left-[152px] m-0 p-0 text-xs'>150 DOTS</p>
									</div>
									<div className='relative top-[20px] flex'>
										<IconCapital className='relative' />
										<p className='history-text relative left-[6px] m-0 p-0 text-xs'>Capital</p>
										<p className='history-text relative left-[173px] m-0 p-0 text-xs'>150 DOTS</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className='solid-border w-55 relative'></div>
			</>
		);
	};
	return (
		<>
			<SEOHead
				title='User Profile'
				network={network}
			/>
			<section className={`my-0 flex h-full min-h-[calc(100vh-150px)] rounded-[4px] pb-5 md:bg-white md:pb-0 md:shadow-md ${className}`}>
				<Details
					userPosts={userPosts.data}
					userProfile={userProfile}
				/>
				<article className='hidden w-[calc(100%-330px)] flex-1 flex-col px-10 py-6 md:flex'>
					<div className='flex items-start justify-between'>
						<h2 className='text-[28px] font-semibold leading-[42px] text-sidebarBlue'>Activity</h2>
						<Select
							value={selectedGov}
							style={{
								width: 120
							}}
							onChange={(v) => {
								setSelectedGov(v);
							}}
							options={[
								{
									label: 'Gov1',
									value: 'gov1'
								},
								{
									label: 'OpenGov',
									value: 'open_gov'
								}
							]}
						/>
					</div>
					<div
						className='-ml-1 flex h-10 w-[152px] items-center justify-center px-[12px] py-[6px] pt-1'
						style={{ backgroundColor: '#F5F6F8', borderRadius: '10px' }}
					>
						<Button
							onClick={() => {
								setVoteClicked(true);
								setPostsClicked(false);
							}}
							className={`border-none px-3 text-base ${voteClicked ? 'bg-white font-semibold text-pink_primary' : 'text-darkBlue bg-transparent font-normal'}`}
						>
							Votes
						</Button>
						<Button
							onClick={() => {
								setVoteClicked(false);
								setPostsClicked(true);
							}}
							className={`border-none px-4 text-base ${postsClicked ? 'bg-white font-semibold text-pink_primary' : 'text-darkBlue bg-transparent font-normal'}`}
						>
							Posts
						</Button>
					</div>
					{postsClicked && (
						<div className='fullHeight mt-6'>
							<Tabs
								className='ant-tabs-tab-bg-white font-medium text-sidebarBlue'
								type='card'
								items={tabItems as any}
							/>
						</div>
					)}
					{voteClicked && (
						<>
							<div className='solid-border w-55 relative mt-6'></div>
							<div
								className='w-55 flex h-[50px]'
								style={{ backgroundColor: '#F5F6F8' }}
							>
								<div className='flex w-[457px]'>
									<p className='relative top-[16px] m-0 px-3 py-0 text-xs text-lightBlue'>Proposal</p>
									<IconExpand className='relative -left-[8px] top-[3px] text-2xl' />
								</div>
								<div className='flex w-[232px]'>
									<p className='relative top-[16px] m-0 px-3 py-0 text-xs text-lightBlue'>Vote</p>
									<IconExpand className='relative -left-[8px] top-[3px] text-2xl' />
								</div>
								<div className='flex'>
									<p className='relative top-[16px] m-0 px-3 py-0 text-xs text-lightBlue'>Status</p>
									<IconExpand className='relative -left-[8px] top-[3px] text-2xl' />
								</div>
							</div>
							<div className='solid-border w-55 relative'></div>
							{/* <div>
								<div
									className='w-55 border-bottom h-[50px]'
									style={{ backgroundColor: '#FFF' }}
								>
									<div className='relative top-[16px] flex px-3'>
										<p className='relative m-0 p-0 text-xs text-bodyBlue'>#1234</p>
										<p className='relative left-[8px] m-0 p-0 text-xs text-bodyBlue'>Omni: Polkadot Enterprise desktop app Treasury Proposal</p>
										<span
											className={`relative ${!isCollapsed ? 'left-[398px]' : '-top-[2px] left-[390px]'}`}
											onClick={toggleCollapse}
										>
											{isCollapsed ? <UpArrow className='upArrow-container' /> : <DownArrow />}
										</span>
									</div>
									<div className={`${isCollapsed ? '' : 'hidden'}`}>{voteInfo()}</div>
								</div>
								<div className={`${isCollapsed ? 'dashed-border' : 'solid-border'} w-55 relative`}></div>
							</div> */}
							<Collapse
								defaultActiveKey={['1']}
								className='border-none bg-white'
								expandIconPosition='end'
								onChange={toggleCollapse}
							>
								<Panel
									className='m-0 h-[50px] border-none bg-white p-0'
									header={
										<>
											<div className='-mt-3 h-[48px]'>
												<div
													className='w-65 border-bottom'
													style={{ backgroundColor: '#FFF' }}
												>
													<div className='relative top-[16px] flex px-3'>
														<p className='relative -left-[16px] m-0 p-0 text-xs text-bodyBlue'>#1234</p>
														<p className='relative -left-[8px] m-0 p-0 text-xs text-bodyBlue'>Omni: Polkadot Enterprise desktop app Treasury Proposal</p>
														{/* <span
														className={`relative ${!isCollapsed ? 'left-[398px]' : '-top-[2px] left-[390px]'}`}
														onClick={toggleCollapse}
													>
														{isCollapsed ? <UpArrow className='upArrow-container' /> : <DownArrow />}
													</span> */}
													</div>
													{/* <div className={`${isCollapsed ? '' : 'hidden'}`}>{voteInfo()}</div> */}
												</div>
											</div>
											<div className={`${!isCollapsed ? 'dashed-border' : 'solid-border'} relative -left-[16px] w-[816px]`}></div>
										</>
									}
									key='1'
								>
									<p className='m-0 border-none p-0'>{voteInfo()}</p>
								</Panel>
							</Collapse>
						</>
					)}
				</article>
			</section>
		</>
	);
};

export default styled(UserProfile)`
	.fullHeight .ant-tabs-content-holder {
		height: 100% !important;
	}
	.fullHeight .ant-tabs-content {
		height: 100% !important;
	}
	.fullHeight .ant-tabs {
		height: 100% !important;
	}
	.fullHeight .ant-tabs-tabpane {
		height: 100% !important;
	}
	.solid-border {
		border: 0.5px solid #d2d8e0;
	}
	.dashed-border {
		border: 0.8px dashed #d2d8e0;
	}
	.upArrow-container {
		transform: scale(0.8) !important;
		right: 2px !important;
	}
	.history-text {
		color: rgba(87, 109, 139, 0.8) !important;
	}
	.ant-collapse .ant-collapse-content {
		border: none !important;
	}
	.ant-collapse .ant-collapse-content > .ant-collapse-content-box {
		padding: 0 !important;
	}
	.ant-collapse.ant-collapse-icon-position-end > .ant-collapse-item > .ant-collapse-header .ant-collapse-expand-icon {
		position: relative;
		right: 55px !important;
	}
`;
