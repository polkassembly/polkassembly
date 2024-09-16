// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { useNetworkSelector } from '~src/redux/selectors';
import { LoadingOutlined } from '@ant-design/icons';
import TabNavigation from './TabNavigation';
import PostList from './PostList';
import { fetchVoterProfileImage, toPascalCase, fetchUserProfile } from './utils/utils';
import { IPostResponse } from './utils/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IPostData } from './utils/types';

interface LatestActivityExploreProps {
	gov2LatestPosts: any;
	currentUserdata?: any;
}

const LatestActivityExplore: React.FC<LatestActivityExploreProps> = ({ gov2LatestPosts, currentUserdata }) => {
	const [currentTab, setCurrentTab] = useState<string | null>('all');
	const [postData, setPostData] = useState<IPostData[]>([]);
	const { network } = useNetworkSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			const pascalCaseTab = toPascalCase(currentTab || 'all');
			const posts = gov2LatestPosts[pascalCaseTab]?.data?.posts || [];

			const detailedPosts = await Promise.all(
				posts.map(async (post: IPostData) => {
					try {
						const postId = post?.post_id ? post.post_id.toString() : '';
						// eslint-disable-next-line prefer-const
						let { data: postDetails } = await nextApiClientFetch<IPostResponse>(`/api/v1/activity-feed/explore-posts?postId=${postId}&network=${network}`);

						// Fetch profile images and user details for posts
						let firstVoterProfileImg = null;
						if (postDetails?.post_reactions?.['👍']?.usernames?.[0]) {
							const username = postDetails.post_reactions['👍'].usernames[0];
							firstVoterProfileImg = await fetchVoterProfileImage(username);
						}

						return {
							...post,
							details: postDetails,
							firstVoterProfileImg,
							proposerProfile: await fetchUserProfile(post.proposer || '')
						};
					} catch (error) {
						console.error(`Error processing post ID ${post.post_id}:`, error);
						return { ...post, error: true };
					}
				})
			);

			setPostData(detailedPosts.filter((post) => !post.error));
		} catch (err) {
			setError('Failed to fetch posts. Please try again later.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [currentTab, network, gov2LatestPosts]);

	if (error) {
		return <div className='text-red-500'>{error}</div>;
	}

	return (
		<div className=''>
			<TabNavigation
				currentTab={currentTab}
				setCurrentTab={setCurrentTab}
				gov2LatestPosts={gov2LatestPosts}
				network={network}
			/>

			{loading ? (
				<div className='flex min-h-[50px] w-full items-center justify-center'>
					<LoadingOutlined />
				</div>
			) : (
				<PostList
					postData={postData}
					currentUserdata={currentUserdata}
				/>
			)}
		</div>
	);
};

export default React.memo(LatestActivityExplore);
