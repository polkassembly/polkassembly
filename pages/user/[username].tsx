// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getUserProfileWithUsername } from 'pages/api/v1/auth/data/userProfileWithUsername';
import { getDefaultUserPosts, getUserPosts, IUserPostsListingResponse } from 'pages/api/v1/listing/user-posts';
import React, { FC, useEffect } from 'react';
import styled from 'styled-components';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { ProfileDetailsResponse } from '~src/auth/types';
import SEOHead from '~src/global/SEOHead';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { network as AllNetworks } from '~src/global/networkConstants';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import ImageIcon from '~src/ui-components/ImageIcon';
import PAProfile from '~src/components/UserProfile';
import { useTheme } from 'next-themes';
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

export const votesHistoryUnavailableNetworks = [AllNetworks.POLYMESH, AllNetworks.COLLECTIVES, AllNetworks.WESTENDCOLLECTIVES];

export const votesUnlockUnavailableNetworks = [
	AllNetworks.MOONBASE,
	AllNetworks.MOONRIVER,
	AllNetworks.POLYMESH,
	AllNetworks.COLLECTIVES,
	AllNetworks.WESTENDCOLLECTIVES,
	AllNetworks.MOONBEAM
];

export const getServerSideProps: GetServerSideProps = async ({ req, query, params }) => {
	let network = getNetworkFromReqHeaders(req.headers);
	const referer = req.headers.referer;

	let queryNetwork = null;
	if (referer) {
		try {
			const url = new URL(referer);
			queryNetwork = url.searchParams.get('network');
		} catch (error) {
			console.error('Invalid referer URL:', referer, error);
		}
	}
	if (queryNetwork) {
		network = queryNetwork;
	}
	if (query?.network) {
		network = query?.network as string;
	}

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const username = params?.username;
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
				created_at: null,
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
export enum EProfileHistory {
	VOTES = 'Votes',
	POSTS = 'Posts'
}

const UserProfile: FC<IUserProfileProps> = (props) => {
	const { userPosts, network, userProfile, className } = props;
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (userPosts.error === 'UserId is invalid') {
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
	if (userPosts.error || userProfile.error) {
		return <ErrorAlert errorMsg={userPosts.error || userProfile.error || ''} />;
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
