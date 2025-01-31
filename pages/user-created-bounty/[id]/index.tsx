// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import React, { FC, useEffect } from 'react';
import { PostCategory } from 'src/global/post_categories';
import BackToListingView from 'src/ui-components/BackToListingView';
import { FrownOutlined } from '@ant-design/icons';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { noTitle } from '~src/global/noTitle';
import SEOHead from '~src/global/SEOHead';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import LoadingState from '~src/basic-components/Loading/LoadingState';
import { getUserCreatedBountyById } from 'pages/api/v1/user-created-bounties/getUserCreatedBounty';
import UserBountyPage from '~src/components/UserCreatedBounties/UserBountyPage';
import { IUserCreatedBounty } from '~src/types';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { id } = query;

	const bountyId = Number(id);
	if (isNaN(bountyId) || bountyId <= 0) {
		return {
			props: {
				error: 'Invalid bounty ID',
				network: getNetworkFromReqHeaders(req.headers),
				post: null,
				status: 400
			}
		};
	}

	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { data, error, status } = await getUserCreatedBountyById({
		bountyId,
		network
	});
	return { props: { error, network, post: data, status } };
};

interface IBountyPostProps {
	post: IUserCreatedBounty;
	error?: string;
	network: string;
	status?: number;
}
const BountyPost: FC<IBountyPostProps> = (props) => {
	const { post, error, network } = props;
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.network]);

	if (error) {
		return (
			<div className='mt-20 flex flex-col items-center justify-center'>
				<div className='flex items-center gap-5'>
					<FrownOutlined className=' -mt-5 text-4xl text-pink_primary dark:text-blue-dark-high' /> <h1 className='text-6xl font-bold'>404</h1>
				</div>
				<p className='mt-2 text-lg text-gray-500'>Post not found. If you just created a post, it might take up to a minute to appear.</p>
				<div className='mt-5'>
					<BackToListingView postCategory={PostCategory.USER_CREATED_BOUNTIES} />
				</div>
			</div>
		);
	}

	if (post) {
		return (
			<>
				<SEOHead
					title={post.title || `${noTitle} - Bounty`}
					desc={post.content}
					network={network}
				/>
				<div className={'transition-opacity duration-500'}>
					<BackToListingView
						postCategory={PostCategory.USER_CREATED_BOUNTIES}
						network={network}
					/>
					<div className='mt-6'>
						<UserBountyPage post={post} />
					</div>
				</div>
			</>
		);
	}

	return (
		<div className='mt-16'>
			<LoadingState />
		</div>
	);
};

export default BountyPost;
