// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Select, Tabs } from 'antd';
import { GetServerSideProps } from 'next';
import { getUserProfileWithUsername } from 'pages/api/v1/auth/data/userProfileWithUsername';
import { getDefaultUserPosts, getUserPosts, IUserPostsListingResponse } from 'pages/api/v1/listing/user-posts';
import React, { FC, useEffect, useState } from 'react';
import { useNetworkContext } from 'src/context';
import styled from 'styled-components';
import { useTheme } from 'next-themes';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { ProfileDetailsResponse } from '~src/auth/types';
import PostsTab from '~src/components/User/PostsTab';
import Details from '~src/components/UserProfile/Details';
import { EGovType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import CountBadgePill from '~src/ui-components/CountBadgePill';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import UserNotFound from '~assets/user-not-found.svg';

interface IUserProfileProps {
	userPosts: {
		data: IUserPostsListingResponse,
		error: string | null;
	};
	userProfile: {
		data: ProfileDetailsResponse;
		error: string | null;
	}
	network: string;
	className?: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const username = context.params?.username;
	if (!username) {
		return { props: {
			error: 'No username provided'
		} };
	}
	const req = context.req;
	const network = getNetworkFromReqHeaders(req.headers);

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
	display:flex;
	flex-direction:column;
	gap:16px;

	svg{
		max-width:600px;
		margin:auto;
	}
`;

const UserProfile: FC<IUserProfileProps> = (props) => {
	const { userPosts, network, userProfile, className } = props;
	const { setNetwork } = useNetworkContext();
	const [selectedGov, setSelectedGov] = useState(EGovType.GOV1);
	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		setNetwork(network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if(userPosts.error === 'UserId is invalid'){
		return (
			<EmptyState>
				<ErrorAlert
					errorMsg="Invalid User. This user does't have any account with Polkassembly"
				/>
				<UserNotFound/>
			</EmptyState>
		);
	}
	if (userPosts.error || userProfile.error) {
		return (
			<ErrorAlert
				errorMsg={userPosts.error || userProfile.error || ''}
			/>
		);
	}
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
			children: (
				<PostsTab
					posts={value}
					theme={theme}
				/>
			),
			key: key,
			label: <CountBadgePill label={key?.split('_').join(' ') || ''} count={count} />
		};
	});
	return (
		<>
			<SEOHead title='User Profile' network={network}/>
			<section className={`my-0 pb-5 md:pb-0 md:bg-white dark:bg-section-dark-overlay md:shadow-md rounded-[4px] flex h-full min-h-[calc(100vh-150px)] ${className}`}>
				<Details userPosts={userPosts.data} userProfile={userProfile} />
				<article className='hidden md:flex flex-1 py-6 px-10 flex-col w-[calc(100%-330px)]'>
					<div className='flex items-start justify-between'>
						<h2 className='font-semibold text-[28px] leading-[42px] text-sidebarBlue dark:text-blue-dark-high'>
						Activity
						</h2>
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
						className='fullHeight'
					>
						<Tabs
							className='ant-tabs-tab-bg-white dark:bg-section-dark-overlay text-sidebarBlue dark:text-blue-dark-medium font-medium'
							type="card"
							items={tabItems as any}
						/>
					</div>
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
`;