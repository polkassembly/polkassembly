// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getUserIdWithAddress, getUserProfileWithUserId } from 'pages/api/v1/auth/data/userProfileWithUsername';
import { getDefaultUserPosts, getUserPosts } from 'pages/api/v1/listing/user-posts';
import React, { FC, useEffect } from 'react';
import styled from 'styled-components';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import SEOHead from '~src/global/SEOHead';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { getOnChainUserPosts } from 'pages/api/v1/listing/get-on-chain-user-post';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import ImageIcon from '~src/ui-components/ImageIcon';
import PAProfile, { IActivitiesCounts } from '~src/components/UserProfile';
import { useTheme } from 'next-themes';
import { getUserActivitiesCount } from 'pages/api/v1/users/activities-count';
import { IUserPostsListingResponse } from '~src/types';
import { updateUserBadges } from 'pages/api/v1/achivementbadges/update-badges';

interface IUserProfileProps {
	activitiesCounts: {
		data: IActivitiesCounts | null;
		error: string | null;
	};
	userPosts: {
		data: IUserPostsListingResponse;
		error: string | null;
	};
	userProfile: any;
	network: string;
	error?: string;
	className?: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { params, req } = context;
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const address = params?.address;
	if (!address) {
		return {
			props: {
				error: 'No address provided'
			}
		};
	}

	const { data, error } = await getUserIdWithAddress(address.toString());

	const userProfile = data || !error ? await getUserProfileWithUserId(Number(data)) : null;

	const userPosts = !userProfile
		? await getOnChainUserPosts({
				addresses: address ? [address] : [],
				network
			})
		: await getUserPosts({
				addresses: userProfile?.data?.addresses || [],
				network,
				userId: userProfile?.data?.user_id
			});

	try {
		if (userProfile?.data?.username) {
			await updateUserBadges(userProfile?.data?.username || '', network);
		}
	} catch (error) {
		console.error(error);
	}
	const activitiesCountsResult = await getUserActivitiesCount({ network, userId: userProfile?.data?.user_id || null });
	let activitiesCounts;
	if (activitiesCountsResult.error) {
		activitiesCounts = {
			data: null,
			error: activitiesCountsResult.error.toString()
		};
	} else {
		activitiesCounts = {
			data: activitiesCountsResult.data,
			error: null
		};
	}
	const props: IUserProfileProps = {
		activitiesCounts: activitiesCounts || { data: { totalActivitiesCount: 0, totalMentionsCount: 0, totalReactionsCount: 0 }, error: null },
		network,
		userPosts: {
			data: userPosts.data || getDefaultUserPosts(),
			error: userPosts.error
		},
		userProfile: userProfile || {
			data: {
				addresses: [address],
				badges: [],
				bio: '',
				image: '',
				social_links: [],
				title: '',
				user_id: null,
				username: ''
			},
			error: ''
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
	const { userPosts, network, userProfile, error, className, activitiesCounts } = props;
	const { resolvedTheme: theme } = useTheme();

	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (userPosts?.error === 'UserId is invalid' || error) {
		return (
			<EmptyState>
				<ErrorAlert
					className={`dark:text-white ${className} ${theme}`}
					errorMsg="Invalid User. This user does't have any account with Polkassembly"
				/>
				{/* <UserNotFound /> */}
				<ImageIcon
					src='/assets/user-not-found.svg'
					alt='user not found icon'
					imgWrapperClassName='w-full h-full flex justify-center items-center'
					imgClassName='max-w-[600px] max-h-[600px]'
				/>
			</EmptyState>
		);
	}
	return (
		<>
			<SEOHead
				title='User Profile'
				network={network}
			/>
			<PAProfile
				userProfile={userProfile.data}
				userPosts={userPosts?.data}
				activitiesCounts={activitiesCounts?.data as any}
			/>
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
	.ant-select-selector {
		height: 40px !important;
		border-radius: 4px !important;
		padding: 4px 12px !important;
	}
	.ant-segmented {
		padding: 4px;
		font-weight: 500 !important;
		color: #464f60 !important;
	}
	.ant-segmented-item-selected {
		text: 14px;
		font-weight: 600 !important;
		color: var(--pink_primary) !important;
	}
`;
